import React, { FunctionComponent, useCallback, useMemo } from "react";
import { HeaderLayout } from "@layouts/index";
import { PageButton } from "../page-button";

import style from "../style.module.scss";
import { useLanguage } from "../../../languages";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";

export const SettingLanguagePage: FunctionComponent = () => {
  const language = useLanguage();
  const navigate = useNavigate();
  const intl = useIntl();

  const selectedIcon = useMemo(
    () => [<i key="selected" className="fas fa-check" />],
    []
  );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      smallTitle={true}
      alternativeTitle={intl.formatMessage({
        id: "setting.language",
      })}
      onBackButton={useCallback(() => {
        navigate(-1);
      }, [navigate])}
    >
      <div className={style["container"]}>
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.automatic",
          })}
          onClick={useCallback(() => {
            language.clearLanguage();
            navigate("/");
          }, [navigate, language])}
          icons={language.automatic ? selectedIcon : undefined}
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.en",
          })}
          onClick={useCallback(() => {
            language.setLanguage("en");
            navigate("/");
          }, [navigate, language])}
          icons={
            !language.automatic && language.language == "en"
              ? selectedIcon
              : undefined
          }
        />
        <PageButton
          title={intl.formatMessage({
            id: "setting.language.ko",
          })}
          onClick={useCallback(() => {
            language.setLanguage("ko");
            navigate("/");
          }, [navigate, language])}
          icons={
            !language.automatic && language.language == "ko"
              ? selectedIcon
              : undefined
          }
        />
      </div>
    </HeaderLayout>
  );
};
