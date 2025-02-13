const prefix = ["doz","mar","bin","wan","sam","lit","sig","hid","fid","lis","sog","dir","wac","sab","wis","sib","rig","sol","dop","mod","fog","lid","hop","dar","dor","lor","hod","fol","rin","tog","sil","mir","hol","pas","lac","rov","liv","dal","sat","lib","tab","han","tic","pid","tor","bol","fos","dot","los","dil","for","pil","ram","tir","win","tad","bic","dif","roc","wid","bis","das","mid","lop","ril","nar","dap","mol","san","loc","nov","sit","nid","tip","sic","rop","wit","nat","pan","min","rit","pod","mot","tam","tol","sav","pos","nap","nop","som","fin","fon","ban","mor","wor","sip","ron","nor","bot","wic","soc","wat","dol","mag","pic","dav","bid","bal","tim","tas","mal","lig","siv","tag","pad","sal","div","dac","tan","sid","fab","tar","mon","ran","nis","wol","mis","pal","las","dis","map","rab","tob","rol","lat","lon","nod","nav","fig","nom","nib","pag","sop","ral","bil","had","doc","rid","moc","pac","rav","rip","fal","tod","til","tin","hap","mic","fan","pat","tac","lab","mog","sim","son","pin","lom","ric","tap","fir","has","bos","bat","poc","hac","tid","hav","sap","lin","dib","hos","dab","bit","bar","rac","par","lod","dos","bor","toc","hil","mac","tom","dig","fil","fas","mit","hob","har","mig","hin","rad","mas","hal","rag","lag","fad","top","mop","hab","nil","nos","mil","fop","fam","dat","nol","din","hat","nac","ris","fot","rib","hoc","nim","lar","fit","wal","rap","sar","nal","mos","lan","don","dan","lad","dov","riv","bac","pol","lap","tal","pit","nam","bon","ros","ton","fod","pon","sov","noc","sor","lav","mat","mip","fip"];
const suffix = ["zod","nec","bud","wes","sev","per","sut","let","ful","pen","syt","dur","wep","ser","wyl","sun","ryp","syx","dyr","nup","heb","peg","lup","dep","dys","put","lug","hec","ryt","tyv","syd","nex","lun","mep","lut","sep","pes","del","sul","ped","tem","led","tul","met","wen","byn","hex","feb","pyl","dul","het","mev","rut","tyl","wyd","tep","bes","dex","sef","wyc","bur","der","nep","pur","rys","reb","den","nut","sub","pet","rul","syn","reg","tyd","sup","sem","wyn","rec","meg","net","sec","mul","nym","tev","web","sum","mut","nyx","rex","teb","fus","hep","ben","mus","wyx","sym","sel","ruc","dec","wex","syr","wet","dyl","myn","mes","det","bet","bel","tux","tug","myr","pel","syp","ter","meb","set","dut","deg","tex","sur","fel","tud","nux","rux","ren","wyt","nub","med","lyt","dus","neb","rum","tyn","seg","lyx","pun","res","red","fun","rev","ref","mec","ted","rus","bex","leb","dux","ryn","num","pyx","ryg","ryx","fep","tyr","tus","tyc","leg","nem","fer","mer","ten","lus","nus","syl","tec","mex","pub","rym","tuc","fyl","lep","deb","ber","mug","hut","tun","byl","sud","pem","dev","lur","def","bus","bep","run","mel","pex","dyt","byt","typ","lev","myl","wed","duc","fur","fex","nul","luc","len","ner","lex","rup","ned","lec","ryd","lyd","fen","wel","nyd","hus","rel","rud","nes","hes","fet","des","ret","dun","ler","nyr","seb","hul","ryl","lud","rem","lys","fyn","wer","ryc","sug","nys","nyl","lyn","dyn","dem","lux","fed","sed","bec","mun","lyr","tes","mud","nyt","byr","sen","weg","fyr","mur","tel","rep","teg","pec","nel","nev","fes"];

export const validateName = (input) => {
  name = input.value || input;
  if(name.length == 0) return 'Please enter a provider name!'
  if(name.charAt(0) == '~') name = name.substring(1);
  if(name.length == 3) return !suffix.includes(name) ? `~<u>${name}</u> is invalid!`:false;
  let chunks = name.split("-");
  let error = null;
  chunks.forEach((n, index) => {
      if(n.length != 6 || !prefix.includes(n.substring(0, 3)) || !suffix.includes(n.substring(3))) {
        let front = chunks.slice(0, index).join('-');
        front = front != '' ? front + '-' : '';
        let end = chunks.slice(index+1).join('-');
        end = end != '' ? '-' + end : '';
        error = `~${front}<u>${chunks[index]}</u>${end} is invalid!`;
        return;
      }
  });
  return error || false;
};

export function satsToCurrency(
  sats: number,
  denomination: Denomination,
  rates: CurrencyRate
) {
  if (!rates) {
    throw 'nonexistent currency table';
  }
  if (!rates[denomination]) {
    denomination = 'BTC';
  }
  let rate = rates[denomination];
  let val = rate ? parseFloat((sats * rate.last * 0.00000001).toFixed(8)) : 0;
  let text;
  if (denomination === 'BTC' && rate) {
    text = val + ' ' + rate.symbol;
  } else if (rate) {
    text =
      rate.symbol + val.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }
  return text;
};

export function checkValid({ element, validators = [] }, setErrors) {
  return async () => {
    element.setCustomValidity("");
    element.checkValidity();
    let message = element.validationMessage;
    if (!message) {
      for (const validator of validators) {
        const text = await validator(element);
        if (text) {
          element.setCustomValidity(text);
          break;
        }
      }
      message = element.validationMessage;
    }
    if (message) {
      setErrors({ [element.name]: message });
    }
  };
}

export function formSubmitBuilder(onClick) {
  return (ref, accessor) => {
    const callback = accessor() || (() => {});
    ref.setAttribute("novalidate", "");
    ref.onsubmit = async (e) => {
      e.preventDefault();
      onClick(e, ref, callback);
    }
  };
}

export function validatorBuilder(fields, errors, setErrors) {
  return (ref, accessor) => {
    const validators = accessor() || [];
    let config;
    fields[ref.name] = config = { element: ref, validators };
    ref.onblur = checkValid(config, setErrors)
    ref.oninput = () => {
        if(!errors[ref.name]) return;
        setErrors({[ref.name]: undefined});
    };
  };
}

const fetchRates = async (symbol) => (await fetch(
    `https://api.blockchain.com/v3/exchange/tickers/${symbol}`,
    {headers: new Headers({'accept': 'application/json'})})).json()
