import * as React from "react";
import type { SVGProps } from "react";
const SvgChat = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Chat Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M17.813 6.563H4.688m9.375 4.687H4.688M22.03 1.875S17.344.469 11.25.469.469 1.875.469 1.875v15.469h4.687v4.218s3.263-1.087 5.007-4.218H22.03z"
    />
  </svg>
);
export default SvgChat;
