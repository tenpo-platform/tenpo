import * as React from "react";
import type { SVGProps } from "react";
const SvgCake = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Cake Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M12.188 3.75a2.813 2.813 0 1 0 0 5.625 2.813 2.813 0 0 0 0-5.625Zm0 0c0-1.553-1.149-2.812-2.813-2.812m5.43 4.593c1.57-.324 2.539-.375 2.539-.375s3.281 2.344 4.218 7.567m0 0v8.84H.939v-8.84m20.625 0H.938m0 0A28.3 28.3 0 0 1 9.448 7.2m12.115 9.943H.938"
    />
  </svg>
);
export default SvgCake;
