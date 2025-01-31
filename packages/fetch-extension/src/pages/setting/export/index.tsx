import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { HeaderLayout } from "@layouts/index";

import { useNavigate, useLocation, useParams } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { PasswordInput } from "@components/form";
import { Button, Form } from "reactstrap";
import { useForm } from "react-hook-form";
import { WarningView } from "./warning-view";

import classnames from "classnames";
import queryString from "query-string";

import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { flowResult } from "mobx";

interface FormData {
  password: string;
}

export const ExportPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { index = "-1 " } = useParams<{ index: string; type?: string }>();

  const intl = useIntl();

  const { keyRingStore } = useStore();

  const query = queryString.parse(location.search);

  const type = query["type"] ?? "mnemonic";

  const [loading, setLoading] = useState(false);
  const [keyRing, setKeyRing] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    if (parseInt(index).toString() !== index) {
      throw new Error("Invalid index");
    }
  }, [index]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id:
          type === "mnemonic" ? "setting.export" : "setting.export.private-key",
      })}
      onBackButton={useCallback(() => {
        navigate(-1);
      }, [navigate])}
    >
      <div className={style["container"]}>
        {keyRing ? (
          <div
            className={classnames(style["mnemonic"], {
              [style["altHex"]]: type !== "mnemonic",
            })}
          >
            {keyRing}
          </div>
        ) : (
          <React.Fragment>
            <WarningView />
            <Form
              onSubmit={handleSubmit(async (data) => {
                setLoading(true);
                try {
                  setKeyRing(
                    await flowResult(
                      keyRingStore.showKeyRing(parseInt(index), data.password)
                    )
                  );
                } catch (e) {
                  console.log("Fail to decrypt: " + e.message);
                  setError("password", {
                    message: intl.formatMessage({
                      id: "setting.export.input.password.error.invalid",
                    }),
                  });
                } finally {
                  setLoading(false);
                }
              })}
            >
              <PasswordInput
                label={intl.formatMessage({
                  id: "setting.export.input.password",
                })}
                error={errors.password && errors.password.message}
                {...register("password", {
                  required: intl.formatMessage({
                    id: "setting.export.input.password.error.required",
                  }),
                })}
              />
              <Button
                type="submit"
                color="primary"
                block
                data-loading={loading}
              >
                <FormattedMessage id="setting.export.button.confirm" />
              </Button>
            </Form>
          </React.Fragment>
        )}
      </div>
    </HeaderLayout>
  );
});
