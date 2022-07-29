import {Urbit, UrbitHttpApi} from "@urbit/http-api";

export async function bootstrapApi() {
  window.urbit         = new Urbit("", "", "volt");
  window.urbit.ship    = window.ship;
  window.urbit.onOpen  = () => this.setState({conn: "ok"});
  window.urbit.onRetry = () => this.setState({conn: "try"});
  window.urbit.onError = () => this.setState({conn: "err"});
  console.log(window.urbit);
  connect();
}

async function connect() {
  window.airlock = await Urbit.authenticate({
    ship: "zod",
    url: "localhost:8081",
    code: "lidlut-tabwed-pillex-ridrup",
    verbose: true
  });
  console.log("connected!");
  test();
}

async function test() {
  window.airlock.subscribe({
    app: 'volt',
    path: 'all',
    event: console.log,
  });

}
