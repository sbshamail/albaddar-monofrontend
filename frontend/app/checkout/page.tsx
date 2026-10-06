import OrderForm from "@/common/order/OrderForm";

export default function CheckoutPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-10">
      <div className="rounded-lg border border-border p-6">
        <OrderForm />
      </div>
    </div>
  );
}
