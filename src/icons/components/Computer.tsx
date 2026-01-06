import * as React from "react";
import type { SVGProps } from "react";
const SvgComputer = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Computer Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M1.406 13.594h19.688m-11.25 3.281c-.938 1.875-3.281 4.219-3.281 4.219h9.375s-2.344-2.344-3.282-4.219M1.406 2.813v12.656s3.282 1.406 9.844 1.406 9.844-1.406 9.844-1.406V2.813s-3.282-1.407-9.844-1.407-9.844 1.407-9.844 1.407Z"
    />
  </svg>
);
export default SvgComputer;
