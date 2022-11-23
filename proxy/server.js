// mode: javascript

const os = require('os')
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const http = require('http')
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

const defaultLndDir = (os.platform == 'darwin') ?
      `${process.env.HOME}/Library/Application Support/Lnd` :
      `${process.env.HOME}/.lnd`
const lndDir = process.env.LND_DIR || defaultLndDir
const dataDir = process.env.DATA_DIR || 'data'
const lndHost = process.env.LND_HOST || 'localhost:10009'
const shipHost = process.env.SHIP_HOST || 'localhost'
const shipPort = process.env.SHIP_PORT || '80'
const network = process.env.BTC_NETWORK || 'mainnet'
const port = process.env.SERVER_PORT || 5000

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'

let macaroon = fs.readFileSync(
    `${lndDir}/${dataDir}/chain/bitcoin/${network}/admin.macaroon`
) .toString('hex');

let loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneoffs: true
}

let packagedef = protoLoader.loadSync (
    ['rpc.proto', 'router.proto', 'invoices.proto', 'chainnotifier.proto'],
    loaderOptions
)

let rpcpkg = grpc.loadPackageDefinition(packagedef)
let routerrpc = rpcpkg.routerrpc
let lnrpc = rpcpkg.lnrpc
let invoicesrpc = rpcpkg.invoicesrpc
let chainrpc = rpcpkg.chainrpc

let cert = fs.readFileSync(`${lndDir}/tls.cert`)
let sslCreds = grpc.credentials.createSsl(cert)
let macaroonCreds = grpc.credentials.createFromMetadataGenerator (
    function(args, callback) {
	let metadata = new grpc.Metadata()
	metadata.add('macaroon', macaroon)
	callback(null, metadata)
    }
)
let creds = grpc.credentials.combineChannelCredentials (
    sslCreds,
    macaroonCreds
)

let lightning = new lnrpc.Lightning(lndHost, creds)
let router = new routerrpc.Router(lndHost, creds)
let invoices = new invoicesrpc.Invoices(lndHost, creds)
let chain = new chainrpc.ChainNotifier(lndHost, creds)

let makeRequestOptions = (path, data) => {
    let options = {
	rejectUnauthorized: false,
	requestCert: true,
	hostname: shipHost,
	port: shipPort,
	path: path,
	method: 'POST',
	headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': data.length
	}
    }
    return options
}

let encodeBytes = (obj) => {
    for (let k in obj) {
	if (Buffer.isBuffer(obj[k]))
	    obj[k] = obj[k].toString('base64')
	else if (typeof obj[k] == "object")
	    encodeBytes(obj[k])
    }
}

let serialize = (obj) => {
    encodeBytes(obj)
    return JSON.stringify(obj)
}

let sendToShip = (path) => {
    let handler = data => {
	let body = serialize(data)
	let options = makeRequestOptions(path, body)
	let req = http.request(options, res => {
	    if (res.statusCode == 201)
		console.log(`${path}: got OK`)
	    else
		console.error(`${path}: got ERR (${res.statusCode})`)

	})
	req.on('error', error => { console.error(error) })
	req.write(body)
	req.end()
    }
    return handler
}

let returnToShip = (res) => {
    let handler = (err, data) => {
	if (err) {
	    res.status(500).json({'code': err.code, 'message': err.details})
	} else {
	    encodeBytes(data)
	    res.json(data)
	}
    }
    return handler
}

let chans = lightning.subscribeChannelEvents({})
chans.on('data', sendToShip('/~volt-channels'))
chans.on('status', status => { console.log(status) })
chans.on('end', () => { console.log("Closing channel monitor") })

let app = express()
app.use(bodyParser.json())

app.get('/getinfo', (req, res) => {
    lightning.getInfo({}, returnToShip(res))
})

app.get('/wallet_balance', (req, res) => {
    lightning.walletBalance({}, returnToShip(res))
})

app.post('/channel', (req, res) => {
    let body = req.body
    if (body.node_pubkey) {
	body.node_pubkey =
	    Buffer.from(body.node_pubkey, 'base64')
    }
    lightning.openChannelSync(body, returnToShip(res))
})

app.delete('/channel/:txid/:oidx', (req, res) => {
    let channel_point = {
	'funding_txid_bytes': Buffer.from(req.params.txid, 'base64'),
	'output_index': new Number(req.params.oidx)
    }
    lightning.closeChannel(channel_point, returnToShip(res))
})

app.post('/payment', (req, res) => {
    let body = req.body
    if (body.dest) {
	body.dest =
	    Buffer.from(body.dest, 'base64')
    }
    if (body.payment_hash) {
	body.payment_hash =
	    Buffer.from(body.payment_hash, 'base64')
    }
    if (body.payment_addr) {
	body.payment_addr =
	    Buffer.from(body.payment_addr, 'base64')
    }
    if (body.last_hop_pubkey) {
	body.last_hop_pubkey =
	    Buffer.from(body.last_hop_pubkey, 'base64')
    }
    if (body.dest_custom_records) {
	for (rec in body.dest_custom_records) {
	    body.value = Buffer.from(body.value, 'base64')
	}
    }
    let call = router.sendPaymentV2(body)
    call.on('data', sendToShip('/~volt-payments'))
    call.on('error', () => sendToShip('/~volt-payments'))
    call.on('end', () => {})
    res.status(200).send({})
})

//  create and subscribe to a hold invoice
app.post('/invoice', (req, res) => {
    let body = req.body
    if (body.hash) {
	body.hash = Buffer.from(body.hash, 'base64')
    }
    invoices.addHoldInvoice(body, (err, resp) => {
	let ret = returnToShip(res)
	if (err) { ret(err, resp) }
	let call = invoices.subscribeSingleInvoice (
	    { 'r_hash' : body.hash }
	)
	call.on('data', sendToShip('/~volt-invoices'))
	call.on('status', () => sendToShip('/~volt-invoices'))
	call.on('end', () => {})
	ret(err, resp)
    })
})

//  cancel a hold invoice
app.delete('/invoice/:payment_hash', (req, res) => {
    let msg = {
	'payment_hash' : Buffer.from(req.params.payment_hash, 'base64')
    }
    invoices.cancelInvoice(msg, returnToShip(res))
})

//  settle a hold invoice with received preimage
app.post('/settle_invoice', (req, res) => {
    let body = req.body
    if (body.preimage) {
	body.preimage =
	    Buffer.from(body.preimage, 'base64')
    }
    invoices.settleInvoice(body, returnToShip(res))
})

//  register confirmations notification
app.post('/confirms', (req, res) => {
    let body = req.body
    if (body.txid) {
	body.txid = Buffer.from(body.txid, 'base64')
    }
    if (body.script) {
	body.script = Buffer.from(body.script, 'base64')
    }
    let call = chain.registerConfirmationsNtfn(body)
    call.on('data', sendToShip('/~volt-confirms'))
    res.status(200).send({})
})

//  register confirmations notification
app.post('/spends', (req, res) => {
    let body = req.body
    if (body.script) {
	body.script = Buffer.from(body.script, 'base64')
    }
    if (body.outpoint.hash) {
	body.outpoint.hash = Buffer.from(body.outpoint.hash, 'base64')
    }
    let call = chain.registerSpendNtfn(body)
    call.on('data', sendToShip('/~volt-spends'))
    res.status(200).send({})
})

app.listen(port, () => console.log(`Proxy listening on port: ${port}`))
