import type { OrderDetail, OrderShippingAddress } from "@/types/order.types";

export function parseAddressJson(addressJson?: string): Record<string, unknown> | null {
  if (!addressJson) return null;
  try {
    return JSON.parse(addressJson) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function resolveAddressFromJson(addressJson?: string): OrderShippingAddress | null {
  const parsed = parseAddressJson(addressJson);
  if (!parsed) return null;

  const firstName = pickString(parsed, "firstName", "FirstName");
  const lastName = pickString(parsed, "lastName", "LastName");
  const fullName =
    pickString(parsed, "fullName", "FullName", "name", "Name") ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    undefined;

  return {
    title: pickString(parsed, "title", "Title"),
    fullName,
    firstName,
    lastName,
    phone: pickString(parsed, "phone", "Phone", "phoneNumber", "PhoneNumber"),
    alternativePhone: pickString(
      parsed,
      "alternativePhone",
      "AlternativePhone",
      "alternativePhoneNumber",
      "AlternativePhoneNumber"
    ),
    email: pickString(parsed, "email", "Email"),
    addressLine1: pickString(
      parsed,
      "addressLine1",
      "AddressLine1",
      "line1",
      "Line1",
      "streetAddress1",
      "StreetAddress1"
    ),
    addressLine2: pickString(
      parsed,
      "addressLine2",
      "AddressLine2",
      "line2",
      "Line2",
      "streetAddress2",
      "StreetAddress2"
    ),
    city: pickString(parsed, "city", "City", "cityName", "CityName"),
    province: pickString(
      parsed,
      "state",
      "State",
      "province",
      "Province",
      "provinceName",
      "ProvinceName"
    ),
    postalCode: pickString(parsed, "postalCode", "PostalCode", "postal", "Postal"),
    country: pickString(parsed, "country", "Country", "countryName", "CountryName"),
    additionalDetails: pickString(parsed, "additionalDetails", "AdditionalDetails"),
  };
}

export function resolveShippingAddress(order: OrderDetail): OrderShippingAddress | null {
  if (order.shippingAddress) {
    return order.shippingAddress;
  }
  return resolveAddressFromJson(order.shippingAddressJson);
}

export function formatOrderDateTime(
  value: string | undefined,
  locale: string | undefined
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(locale || undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function translateOrderStatus(
  status: string,
  t: (key: string) => string
): string {
  const key = `profile.orders.status${status}`;
  const translated = t(key);
  return translated !== key ? translated : status;
}

export function translatePaymentStatus(
  status: string,
  t: (key: string) => string
): string {
  const key = `profile.orders.paymentStatus${status}`;
  const translated = t(key);
  return translated !== key ? translated : status;
}

export function orderStatusTone(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "Processing":
      return "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800";
    case "Completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    case "Cancelled":
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
}

export function paymentStatusTone(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "Paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    case "Failed":
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
}
