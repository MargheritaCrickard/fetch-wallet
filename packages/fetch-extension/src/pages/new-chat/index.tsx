import { fromBech32 } from "@cosmjs/encoding";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import jazzicon from "@metamask/jazzicon";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { NameAddress } from "@chatTypes";
import { userDetails } from "@chatStore/user-slice";
import { ChatLoader } from "@components/chat-loader";
import { SwitchUser } from "@components/switch-user";
import { HeaderLayout } from "@layouts/index";
import chevronLeft from "@assets/icon/chevron-left.png";
import rightArrowIcon from "@assets/icon/right-arrow.png";
import searchIcon from "@assets/icon/search.png";
import { useStore } from "../../stores";
import { fetchPublicKey } from "@utils/fetch-public-key";
import { formatAddress } from "@utils/format";
import { Menu } from "../main/menu";
import style from "./style.module.scss";
import { store } from "@chatStore/index";
import { resetNewGroup } from "@chatStore/new-group-slice";
import { DeactivatedChat } from "@components/chat/deactivated-chat";
import { AGENT_ADDRESS } from "../../config.ui.var";
import { ContactsOnlyMessage } from "@components/contacts-only-message";

const NewUser = (props: { address: NameAddress }) => {
  const navigate = useNavigate();
  const user = useSelector(userDetails);
  const { chainStore, analyticsStore } = useStore();
  const { name, address } = props.address;
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const current = chainStore.current;
  useEffect(() => {
    const isUserActive = async () => {
      try {
        const pubKey = await fetchPublicKey(
          user.accessToken,
          current.chainId,
          address
        );
        if (!pubKey || !pubKey.publicKey || !(pubKey.publicKey.length > 0))
          setIsActive(false);
      } catch (e) {
        console.log("NewUser/isUserActive error", e);
      } finally {
        setIsLoading(false);
      }
    };
    isUserActive();
  }, [
    address,
    user.accessToken,
    user.messagingPubKey.privacySetting,
    user.messagingPubKey.chatReadReceiptSetting,
    current.chainId,
  ]);

  const handleClick = () => {
    if (!isLoading) {
      analyticsStore.logEvent("Open DM click", {
        pageName: "New chat",
      });
      navigate(`/chat/${address}`);
    }
  };

  return (
    <div
      className={style["messageContainer"]}
      {...(isActive && { onClick: handleClick })}
    >
      <div className={style["initials"]}>
        {ReactHtmlParser(
          jazzicon(24, parseInt(fromBech32(address).data.toString(), 16))
            .outerHTML
        )}
      </div>
      <div className={style["messageInner"]}>
        <div className={style["name"]}>{formatAddress(name)}</div>
        {!isActive && <div className={style["inactiveText"]}>Inactive</div>}
      </div>
      <div>
        {isLoading ? (
          <i className="fas fa-spinner fa-spin ml-1" />
        ) : (
          <img
            draggable={false}
            src={rightArrowIcon}
            style={{ width: "80%" }}
            alt="message"
          />
        )}
      </div>
    </div>
  );
};
export const NewChat: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const user = useSelector(userDetails);
  const [inputVal, setInputVal] = useState("");
  const [addresses, setAddresses] = useState<NameAddress[]>([]);
  const [randomAddress, setRandomAddress] = useState<NameAddress | undefined>();

  const {
    chainStore,
    accountStore,
    queriesStore,
    uiConfigStore,
    analyticsStore,
  } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.bech32Address;
  // address book values
  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    accountInfo.bech32Address,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
    }
  );

  const [selectedChainId] = useState(
    ibcTransferConfigs.channelConfig?.channel
      ? ibcTransferConfigs.channelConfig.channel.counterpartyChainId
      : current.chainId
  );
  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    selectedChainId,
    {
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    }
  );

  const userAddresses: NameAddress[] = addressBookConfig.addressBookDatas
    .filter((data) => !data.address.startsWith("agent"))
    .map((data) => {
      return { name: data.name, address: data.address };
    })
    .sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

  useEffect(() => {
    setAddresses(userAddresses.filter((a) => a["address"] !== walletAddress));
  }, [addressBookConfig.addressBookDatas]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    const searchedVal = e.target.value.toLowerCase();
    const addresses = userAddresses.filter(
      (address: NameAddress) =>
        address["address"] !== walletAddress &&
        (address["name"].toLowerCase().includes(searchedVal) ||
          address["address"].toLowerCase().includes(searchedVal))
    );

    if (
      addresses.length === 0 &&
      searchedVal &&
      searchedVal !== walletAddress &&
      user?.messagingPubKey.privacySetting === PrivacySetting.Everybody
    ) {
      try {
        //check if searchedVal is valid address
        Bech32Address.validate(
          searchedVal,
          chainStore.current.bech32Config.bech32PrefixAccAddr
        );
        const address: NameAddress = {
          name: formatAddress(searchedVal),
          address: searchedVal,
        };
        setRandomAddress(address);
        setAddresses([]);
        // setAddresses([address]);
      } catch (e) {
        setAddresses([]);
        setRandomAddress(undefined);
      }
    } else {
      setRandomAddress(undefined);
      setAddresses(addresses);
    }
  };

  if (
    user.messagingPubKey.privacySetting &&
    user.messagingPubKey.privacySetting === PrivacySetting.Nobody
  ) {
    return <DeactivatedChat />;
  }

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      {!addressBookConfig.isLoaded ? (
        <ChatLoader message="Loading contacts, please wait..." />
      ) : (
        <div className={style["newChatContainer"]}>
          <div className={style["newChatHeader"]}>
            <div className={style["leftBox"]}>
              <img
                alt=""
                className={style["backBtn"]}
                src={chevronLeft}
                onClick={() => {
                  navigate(-1);
                }}
              />
              <span className={style["title"]}>New Chat</span>
            </div>
          </div>
          <div className={style["searchContainer"]}>
            <div className={style["searchBox"]}>
              <img draggable={false} src={searchIcon} alt="search" />
              <input
                placeholder="Search by name or address"
                value={inputVal}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className={style["searchHelp"]}>
            You can search your contacts or paste any valid {current.chainName}{" "}
            address to start a conversation.
            <br /> or <br />
            <button
              className={style["button"]}
              onClick={() => {
                store.dispatch(resetNewGroup());
                navigate({
                  pathname: "/chat/group-chat/create",
                });
              }}
            >
              Create new group chat
            </button>
            <br />
            <button
              className={style["button"]}
              onClick={() => {
                navigate({
                  pathname: "/chat/agent/" + AGENT_ADDRESS[current.chainId],
                });
              }}
              disabled={!user.walletConfig.fetchbotActive}
              hidden={!user.walletConfig.fetchbotActive}
            >
              Talk to Fetchbot
            </button>
          </div>

          <div className={style["messagesContainer"]}>
            {randomAddress && (
              <NewUser address={randomAddress} key={randomAddress["address"]} />
            )}
            <div className={style["contacts"]}>
              <div>Your contacts</div>
              <i
                className="fa fa-user-plus"
                style={{ margin: "2px 0 0 12px", cursor: "pointer" }}
                aria-hidden="true"
                onClick={() => {
                  analyticsStore.logEvent("Address book viewed");
                  navigate("/setting/address-book");
                }}
              />
            </div>
            {addresses.map((address: NameAddress) => {
              return <NewUser address={address} key={address["address"]} />;
            })}
          </div>
          {addresses.length === 0 && (
            <div>
              <div className={style["resultText"]}>
                No results in your contacts.
              </div>
              {user?.messagingPubKey.privacySetting ===
                PrivacySetting.Contacts && <ContactsOnlyMessage />}
            </div>
          )}
        </div>
      )}
    </HeaderLayout>
  );
});
