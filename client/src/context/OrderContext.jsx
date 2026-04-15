/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  MY_ORDERS_API_URL,
  ORDERS_API_URL,
  getAuthorizationHeader,
  getStoredSession,
} from "../utils/auth";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshOrders = useCallback(async () => {
    const authorizationHeader = getAuthorizationHeader();
    const storedSession = getStoredSession();

    if (!authorizationHeader || !storedSession?.user) {
      setOrders([]);
      setIsLoading(false);
      setError("");
      return [];
    }

    try {
      setIsLoading(true);
      const targetUrl =
        storedSession.user.userType === "admin" ? ORDERS_API_URL : MY_ORDERS_API_URL;
      const response = await fetch(targetUrl, {
        headers: {
          Authorization: authorizationHeader,
        },
      });
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.message || "주문 목록을 불러오지 못했습니다.");
      }

      setOrders(data);
      setError("");
      return data;
    } catch (fetchError) {
      setOrders([]);
      setError(fetchError.message || "주문 목록을 불러오지 못했습니다.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const addOrder = useCallback(async (orderData) => {
    const authorizationHeader = getAuthorizationHeader();
    const response = await fetch(ORDERS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "주문 저장에 실패했습니다.");
    }

    setOrders((currentOrders) => [data, ...currentOrders]);
    return data;
  }, []);

  const getOrderById = useCallback(
    (orderId) => orders.find((order) => order.id === orderId),
    [orders]
  );

  const getUserOrders = useCallback(
    (userKey) =>
      orders.filter(
        (order) =>
          (order.userKey && order.userKey === userKey) ||
          (order.userId && String(order.userId) === String(userKey))
      ),
    [orders]
  );

  const getAllOrders = useCallback(() => orders, [orders]);

  const updateOrderStatus = useCallback(async (orderId, status, trackingNumber = "") => {
    const authorizationHeader = getAuthorizationHeader();

    if (!authorizationHeader) {
      throw new Error("관리자 인증이 필요합니다.");
    }

    const response = await fetch(`${ORDERS_API_URL}/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      body: JSON.stringify({ status, trackingNumber }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "주문 상태 변경에 실패했습니다.");
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === orderId ? data : order))
    );

    return data;
  }, []);

  const value = {
    orders,
    isLoading,
    error,
    refreshOrders,
    addOrder,
    getOrderById,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }

  return context;
}
