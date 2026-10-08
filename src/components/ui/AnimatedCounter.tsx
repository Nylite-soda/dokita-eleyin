interface AnimatedCounterProps { value: number; duration?: number }

/** Show the actual value immediately, including without JavaScript or reduced motion. */
export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  return <span>{value.toLocaleString('en-NG')}</span>
}
