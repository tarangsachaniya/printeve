/** Standard 15-character GSTIN format (checksum not validated — format only). Mirrors printvana-api's utils/gst.ts. */
export const GST_NUMBER_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function isValidGstNumber(value: string): boolean {
  return GST_NUMBER_REGEX.test(value.trim().toUpperCase());
}
