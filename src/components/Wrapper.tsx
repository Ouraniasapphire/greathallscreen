import { JSX } from "solid-js";

type WrapperProps = {
  condition: boolean | number;
  Active: (props: { children: JSX.Element }) => JSX.Element;
  Inactive: (props: { children: JSX.Element }) => JSX.Element;
  children: JSX.Element;
};

export default function Wrapper(props: WrapperProps) {
  const Cond = props.condition ? props.Active : props.Inactive;
  return <Cond>{props.children}</Cond>;
}
