import React, { useMemo } from "react";
import style from "./style.module.scss";
import { useNavigate } from "react-router";
import { useStore } from "../../stores";
import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "../../config.ui.var";

export const WalletActions = observer(() => {
  const navigate = useNavigate();

  const { accountStore, chainStore, queriesStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);
  const queryBalances = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const hasAssets =
    queryBalances.balances.find((bal) => bal.balance.toDec().gt(new Dec(0))) !==
    undefined;
  const isEvm = chainStore.current.features?.includes("evm") ?? false;

  const isStakableInApp = [CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB].includes(
    chainStore.current.chainId
  );
  const stakable = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  ).stakable;
  const isStakableExist = useMemo(() => {
    return stakable.balance.toDec().gt(new Dec(0));
  }, [stakable.balance]);
  console.log(isStakableExist);

  return (
    <div className={style["actions"]}>
      <div className={style["action"]}>
        <img
          style={{ width: "42px", height: "42px" }}
          src={require("@assets/svg/wireframe/arrow-down.svg")}
          alt=""
        />
        <div className={style["img-title"]}>Recieve</div>
      </div>

      <div
        className={style["action"]}
        onClick={() => {
          if (hasAssets) {
            navigate("/send");
          }
        }}
      >
        <img
          style={{ width: "42px", height: "42px" }}
          src={require("@assets/svg/wireframe/arrow-up.svg")}
          alt=""
        />
        <div className={style["img-title"]}>Send</div>
      </div>
      <div className={style["action"]}>
        <img
          style={{ width: "42px", height: "42px" }}
          src={require("@assets/svg/wireframe/swap.svg")}
          alt=""
        />
        <div className={style["img-title"]}>Swap</div>
      </div>
      {isStakableInApp && (
        <div
          onClick={() =>
            navigate(
              isStakableInApp
                ? "/validators/validator"
                : chainStore.current.walletUrlForStaking || ""
            )
          }
          className={style["action"]}
        >
          <img
            style={{ width: "42px", height: "42px" }}
            src={require("@assets/svg/wireframe/stake.svg")}
            alt=""
          />
          <div className={style["img-title"]}>Stake</div>
        </div>
      )}

      <div
        onClick={() => {
          if (isEvm) {
            navigate("/axl-bridge-evm");
          } else {
            navigate("/axl-bridge-cosmos");
          }
        }}
        className={style["action"]}
      >
        <img
          style={{ width: "42px", height: "42px" }}
          src={require("@assets/svg/wireframe/bridge.svg")}
          alt=""
        />
        <div className={style["img-title"]}>Bridge</div>
      </div>
      <div className={style["action"]}>
        <img
          style={{ width: "42px", height: "42px" }}
          src={require("@assets/svg/wireframe/buy.svg")}
          alt=""
        />
        <div className={style["img-title"]}>Buy</div>
      </div>
    </div>
  );
});
