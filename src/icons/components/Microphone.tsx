import * as React from "react";
import type { SVGProps } from "react";
const SvgMicrophone = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Microphone Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M11.25 18.281c4.688 0 7.031-1.875 7.031-1.875V7.5M11.25 18.281c-4.687 0-7.031-1.875-7.031-1.875V7.5m7.031 10.781v3.75M7.031 4.22h2.344m3.75 0h2.344M7.03 7.969h2.344m3.75 0h2.344m-8.438 3.75h2.344m3.75 0h2.344m1.406 10.312H5.625M11.25.47H7.031v14.426c1.09.32 2.496.574 4.219.574s3.13-.253 4.219-.574V.469z"
    />
  </svg>
);
export default SvgMicrophone;
