import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { AlertIcon, RefreshIcon } from "../../components/icon";
import { useStyle } from "../../styles";
import { useNetInfo } from "@react-native-community/netinfo";
import { TouchableOpacity } from "react-native-gesture-handler";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { ObservableQuery } from "@keplr-wallet/stores";

// Todo network animation
export const NetworkErrorView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const queryUnbonding =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    );

  const style = useStyle();

  // const extraHeight = 32;

  const netInfo = useNetInfo();
  const networkIsConnected =
    typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;

  // const [isOpen, setIsOpen] = useState(false);
  const [isRefreshable, setIsRefreshable] = useState(true);
  const [message, setMessage] = useState("");

  const prevNetworkIsConnected = useRef(true);
  useEffect(() => {
    if (!networkIsConnected) {
      //setIsOpen(true);
      setMessage("No internet connection");
      setIsRefreshable(false);
    } else {
      // setIsOpen(false);

      // If the network is recovered.
      if (!prevNetworkIsConnected.current) {
        ObservableQuery.refreshAllObserved();
      }
    }

    return () => {
      prevNetworkIsConnected.current = networkIsConnected;
    };
  }, [networkIsConnected]);

  useEffect(() => {
    if (networkIsConnected) {
      const error =
        queryStakable.error || queryDelegated.error || queryUnbonding.error;

      debugger;
      if (error) {
        const errorData = error.data as { error?: string } | undefined;
        const message = (() => {
          if (errorData?.error) {
            return "Failed to get response\n" + errorData.error;
          }

          return error.message || "Unknown error";
        })();

        // setIsOpen(true);
        setMessage(message);
        setIsRefreshable(true);
      } else {
        // setIsOpen(false);
      }
    }
  }, [
    queryStakable.error,
    queryDelegated.error,
    queryUnbonding.error,
    networkIsConnected,
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  // const spinAnimated = useSpinAnimated(isRefreshing);

  useEffect(() => {
    if (isRefreshing) {
      if (
        !queryStakable.isFetching &&
        !queryDelegated.isFetching &&
        !queryUnbonding.isFetching
      ) {
        setIsRefreshing(false);
      }
    }
  }, [
    isRefreshing,
    queryDelegated.isFetching,
    queryStakable.isFetching,
    queryUnbonding.isFetching,
  ]);

  // const [childLayout, setChildLayout] = useState<{
  //   width: number;
  //   height: number;
  // }>({
  //   width: 0,
  //   height: 0,
  // });

  // const animatedValue = useSharedValue(0);

  // useEffect(() => {
  //   if (isOpen) {
  //     withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
  //   } else {
  //     withTiming(0, { duration: 330, easing: Easing.out(Easing.sin) });
  //   }
  // }, [isOpen]);

  // const animatedHeight = useMemo(() => {
  //   return interpolate(
  //     animatedValue.value,
  //     [0, 1],
  //     [0, childLayout.height + extraHeight]
  //   );
  // }, [childLayout.height]);

  return (
    <Animated.View
      style={{
        overflow: "hidden",
        //height: animatedHeight,
        justifyContent: "center",
      }}
    >
      <View
        style={
          style.flatten([
            "flex-row",
            "items-center",
            "background-color-red-50@95%",
            "dark:background-color-red-500@40%",
            "padding-left-26",
            "padding-right-24",
            "height-80",
          ]) as ViewStyle
        }
        // onLayout={(e) => {
        //   setChildLayout({
        //     width: e.nativeEvent.layout.width,
        //     height: e.nativeEvent.layout.height,
        //   });
        // }}
      >
        <View style={style.flatten(["margin-right-16"]) as ViewStyle}>
          <AlertIcon
            color={style.flatten(["color-red-400", "dark:color-red-300"]).color}
            size={24}
          />
        </View>
        <View style={style.flatten(["flex-1", "overflow-visible"])}>
          <Text
            style={style.flatten([
              "subtitle2",
              "color-red-400",
              "dark:color-red-300",
              "overflow-visible",
            ])}
          >
            {message}
          </Text>
        </View>
        {isRefreshable ? (
          <TouchableOpacity
            disabled={isRefreshing}
            onPress={() => {
              setIsRefreshing(true);
              ObservableQuery.refreshAllObservedIfError();
            }}
            style={
              style.flatten([
                "background-color-red-100",
                "justify-center",
                "items-center",
                "width-32",
                "height-32",
                "border-radius-64",
                "margin-left-16",
              ]) as ViewStyle
            }
          >
            <Animated.View
            // style={{
            //   transform: [
            //     {
            //       rotate: spinAnimated,
            //     },
            //   ],
            // }}
            >
              <RefreshIcon color={style.get("color-red-300").color} size={24} />
            </Animated.View>
          </TouchableOpacity>
        ) : null}
      </View>
    </Animated.View>
  );
});
