import { LoadingSvgScreen } from '@/components/ui/LoadingSvgScreen'

const loading = () => {
  return (
    <div className="absolute inset-0 z-10 backdrop-blur-md">
      <LoadingSvgScreen
        fullScreen={false}
        className="bg-[hsl(var(--background)/0.88)]"
        message="Loading room form..."
      />
    </div>
  )
}

export default loading
