import React from "react";
import { SearchInput } from "./search-input";
import style from "./style.module.scss";
export const ExploreDomain = () => {
  return (
    <React.Fragment>
      <div className={style["content"]}>
        Your all inclusive <br />{" "}
        <div className={style["gradientContent"]}>
          decentralized naming system
        </div>
      </div>
      <SearchInput />
      <div className={style["bottomContent"]}>
        <a
          href="https://www.fetns.domains/market"
          target="_blank"
          rel="noreferrer"
          className={style["moreDetails"]}
        >
          <img
            src={require("@assets/svg/All minted domains.svg")}
            alt=""
            draggable={false}
          />
          <img
            className={style["arrowIcon"]}
            src={require("@assets/svg/arrow-right-outline.svg")}
            alt=""
            draggable={false}
          />
        </a>
        <div className={style["border"]} />
        <a
          href="https://www.fetns.domains/collections"
          target="_blank"
          rel="noreferrer"
          className={style["moreDetails"]}
        >
          <img
            src={require("@assets/svg/collections.svg")}
            alt=""
            draggable={false}
          />
          <img
            className={style["arrowIcon"]}
            src={require("@assets/svg/arrow-right-outline.svg")}
            alt=""
            draggable={false}
          />
        </a>
      </div>
    </React.Fragment>
  );
};
