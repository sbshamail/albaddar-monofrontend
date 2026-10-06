"use client";
import { useEffect } from "react";
const Page = () => {
  const getProduct = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/product/list`,
    );
    // console.log(res);
  };
  useEffect(() => {
    getProduct();
  }, []);
  return <div>Testing PAGE</div>;
};

export default Page;
