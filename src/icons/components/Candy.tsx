import * as React from "react";
import type { SVGProps } from "react";
const SvgCandy = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="-0.75 -0.75 24 24"
    width="1em"
    height="1em"
    aria-hidden="true"
    {...props}
  >
    <desc>{"Candy Streamline Icon: https://streamlinehq.com"}</desc>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M16.84 6.806c1.236-.234 3.096-.513 4.957-.513 0 0-.237-2.159-1.834-3.755C18.366.94 16.207.703 16.207.703c0 1.861-.279 3.722-.513 4.957M5.66 15.694c-1.236.234-3.096.513-4.957.513 0 0 .237 2.159 1.835 3.756 1.596 1.597 3.755 1.834 3.755 1.834 0-1.862.28-3.725.514-4.96m11.78-4.67s.46-3.21-2.293-5.96c-2.75-2.752-5.96-2.294-5.96-2.294l-6.42 6.42s-.46 3.21 2.292 5.96c2.75 2.752 6.092 2.163 6.092 2.163z"
    />
  </svg>
);
export default SvgCandy;
