import React, { FunctionComponent, useState } from "react";

import { PasswordInput } from "@components/form";

import { Button, Form } from "reactstrap";

import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Banner } from "@components/banner";
import { useForm } from "react-hook-form";

import { EmptyLayout } from "@layouts/empty-layout";

import style from "./style.module.scss";

import { FormattedMessage, useIntl } from "react-intl";
import { useInteractionInfo } from "@keplr-wallet/hooks";
import { useNavigate } from "react-router";
import delay from "delay";
import { StartAutoLockMonitoringMsg } from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const navigate = useNavigate();

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

  const { keyRingStore } = useStore();
  const [loading, setLoading] = useState(false);

  const interactionInfo = useInteractionInfo(() => {
    keyRingStore.rejectAll();
  });

  return (
    <EmptyLayout style={{ backgroundColor: "white", height: "100%" }}>
      <Form
        className={style["formContainer"]}
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          try {
            await keyRingStore.unlock(data.password);

            const msg = new StartAutoLockMonitoringMsg();
            const requester = new InExtensionMessageRequester();
            // Make sure to notify that auto lock service to start check locking after duration.
            await requester.sendMessage(BACKGROUND_PORT, msg);

            if (interactionInfo.interaction) {
              if (!interactionInfo.interactionInternal) {
                // XXX: If the connection doesn't have the permission,
                //      permission service tries to grant the permission right after unlocking.
                //      Thus, due to the yet uncertain reason, it requests new interaction for granting permission
                //      before the `window.close()`. And, it could make the permission page closed right after page changes.
                //      Unfortunately, I still don't know the exact cause.
                //      Anyway, for now, to reduce this problem, jsut wait small time, and close the window only if the page is not changed.
                await delay(100);
                if (window.location.href.includes("#/unlock")) {
                  window.close();
                }
              } else {
                navigate("/", { replace: true });
              }
            }
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError("password", {
              message: intl.formatMessage({
                id: "lock.input.password.error.invalid",
              }),
            });
            setLoading(false);
          }
        })}
      >
        <Banner
          icon={require("@assets/logo-256.svg")}
          logo={require("@assets/brand-text.png")}
        />
        <PasswordInput
          label={intl.formatMessage({
            id: "lock.input.password",
          })}
          error={errors.password && errors.password.message}
          {...register("password", {
            required: intl.formatMessage({
              id: "lock.input.password.error.required",
            }),
          })}
        />
        <Button type="submit" color="primary" block data-loading={loading}>
          <FormattedMessage id="lock.button.unlock" />
        </Button>
      </Form>
    </EmptyLayout>
  );
});
