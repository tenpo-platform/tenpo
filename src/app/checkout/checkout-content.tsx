"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthWidget } from "@/components/auth/auth-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";

const CHECKOUT_RETURN = "/checkout?checkout=continue";
const AGREEMENT_STORAGE_KEY = "tenpo:checkout:agreement";

interface CheckoutContentProps {
  checkoutParam?: string;
}

export function CheckoutContent({ checkoutParam }: CheckoutContentProps) {
  const router = useRouter();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const storedAgreement =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(AGREEMENT_STORAGE_KEY)
        : null;
    if (storedAgreement === "true") {
      setHasAgreed(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.sessionStorage.setItem(
      AGREEMENT_STORAGE_KEY,
      hasAgreed ? "true" : "false"
    );
  }, [hasAgreed]);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setIsAuthed(Boolean(user));
      setSessionChecked(true);
    };

    loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }
      setIsAuthed(Boolean(session?.user));
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionChecked || checkoutParam !== "continue" || !isAuthed) {
      return;
    }

    if (!hasAgreed) {
      setError("Please confirm the checkout requirements to continue.");
      return;
    }

    setCheckoutReady(true);
    setPendingCheckout(false);
    router.replace("/checkout");
  }, [checkoutParam, hasAgreed, isAuthed, router, sessionChecked]);

  const handleCheckout = () => {
    setError(null);

    if (!hasAgreed) {
      setError("Please confirm the checkout requirements to continue.");
      return;
    }

    if (!isAuthed) {
      setPendingCheckout(true);
      setAuthOpen(true);
      return;
    }

    setCheckoutReady(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthed(true);
    setAuthOpen(false);
    if (pendingCheckout) {
      setCheckoutReady(true);
      setPendingCheckout(false);
    }
  };

  const handleAuthOpenChange = (open: boolean) => {
    setAuthOpen(open);
    if (!open) {
      setPendingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="space-y-2">
          <div className="inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Mock Checkout
          </div>
          <h1 className="text-3xl font-semibold">Complete your booking</h1>
          <p className="text-muted-foreground text-sm">
            This is a simple, unprotected checkout page to validate the auth
            modal flow for parents.
          </p>
        </header>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Camp details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Elite Skills Camp</span>
                <span className="font-medium">$320.00</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Dates</span>
                <span>Jun 10 - Jun 14</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Location</span>
                <span>Tenpo Training Field</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Camp fee</span>
                <span>$320.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Processing</span>
                <span>$6.25</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>$326.25</span>
              </div>

              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={hasAgreed}
                  onCheckedChange={(value) => {
                    const nextValue = value === true;
                    setHasAgreed(nextValue);
                    if (nextValue) {
                      setError(null);
                    }
                  }}
                />
                <span className="text-muted-foreground">
                  I understand this is a mock checkout and no payment will be
                  processed.
                </span>
              </label>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button
                type="button"
                className="w-full"
                disabled={!sessionChecked}
                onClick={handleCheckout}
              >
                Continue to payment
              </Button>

              {!isAuthed && (
                <p className="text-muted-foreground text-center text-xs">
                  You&apos;ll be asked to sign in or create an account before
                  you can continue.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {checkoutReady && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Checkout unlocked. This is where payment details would appear after
            authentication.
          </div>
        )}
      </div>

      <AuthModal open={authOpen} onOpenChange={handleAuthOpenChange}>
        <AuthWidget
          context="checkout"
          campName="Elite Skills Camp"
          returnTo={CHECKOUT_RETURN}
          onSuccess={handleAuthSuccess}
        />
      </AuthModal>
    </div>
  );
}
