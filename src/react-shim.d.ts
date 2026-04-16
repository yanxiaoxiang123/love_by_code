declare module 'react' {
  export type ReactNode = unknown;
  export type SetStateAction<State> = State | ((prevState: State) => State);
  export type Dispatch<Action> = (value: Action) => void;
  export type ComponentLike = (props: { children?: ReactNode; key?: unknown }) => any;

  export interface MutableRefObject<Value> {
    current: Value;
  }

  export interface RefObject<Value> {
    current: Value | null;
  }

  export function useState<State>(
    initialState: State | (() => State),
  ): [State, Dispatch<SetStateAction<State>>];
  export function useEffect(
    effect: () => void | (() => void),
    deps?: readonly unknown[],
  ): void;
  export function useMemo<Value>(factory: () => Value, deps: readonly unknown[]): Value;
  export function useRef<Value>(initialValue: Value): MutableRefObject<Value>;
  export function useRef<Value>(initialValue: Value | null): RefObject<Value>;
  export const Fragment: ComponentLike;
  export const StrictMode: ComponentLike;

  const React: {
    Fragment: typeof Fragment;
    StrictMode: typeof StrictMode;
  };

  export default React;
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }

  export const Fragment: unknown;
  export function jsx(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export function jsxs(type: unknown, props: unknown, key?: unknown): JSX.Element;
}

declare module 'react-dom/client' {
  export interface Root {
    render(children: unknown): void;
    unmount(): void;
  }

  export function createRoot(container: Element | DocumentFragment): Root;
}
