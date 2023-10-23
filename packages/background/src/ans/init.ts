import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { NameService } from "./service";
import {
  PubKeyPayload,
  SignPayload,
  MakeVerificationStringPayload,
} from "./messages";
import { getNameServiceHandler } from "./handler";

export function init(router: Router, service: NameService): void {
  router.registerMessage(SignPayload);
  router.registerMessage(PubKeyPayload);
  router.registerMessage(MakeVerificationStringPayload);
  router.addHandler(ROUTE, getNameServiceHandler(service));
}
