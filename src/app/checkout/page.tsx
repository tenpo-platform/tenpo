import { Suspense } from "react";
import { CheckoutContent } from "./checkout-content";

interface CheckoutPageProps {
  searchParams: Promise<{ checkout?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const checkoutParam = params.checkout;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent checkoutParam={checkoutParam} />
    </Suspense>
  );
}
