import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
interface FloatingActionButtonProps {
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
}
const FloatingActionButton = ({
  onClick = () => console.log('FAB clicked'),
  icon = <Plus className='h-6 w-6' />,
  className = ''
}: FloatingActionButtonProps) => {
  return (
    <Button
      className={`fixed bottom-20 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center z-10 ${className}`}
      onClick={onClick}
      size='icon'
      aria-label='Add new event'
    >
      {icon}
    </Button>
  )
}
export default FloatingActionButton
