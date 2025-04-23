
interface AddCustomerStepTitleProps {
  step: number;
  existingCustomer: boolean;
}
export function AddCustomerStepTitle({ step, existingCustomer }: AddCustomerStepTitleProps) {
  if (step === 1) return <h2 className="text-2xl font-bold">Add New Customer</h2>;
  if (step === 2) return <h2 className="text-2xl font-bold">
    {existingCustomer ? "Edit Customer" : "Customer Details"}
  </h2>;
  if (step === 3) return <h2 className="text-2xl font-bold">Measurements</h2>;
  if (step === 4) return <h2 className="text-2xl font-bold">Create Order</h2>;
  if (step === 5) return <h2 className="text-2xl font-bold">Payment Details</h2>;
  return <h2 className="text-2xl font-bold">Customer Added</h2>;
}
