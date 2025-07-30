import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Trash2, MoreVertical } from 'lucide-react'
import { Deal } from '../types'

interface DealRowActionsProps {
  deal: Deal
  onEdit: (deal: Deal) => void
  onDelete: (deal: Deal) => void
  className?: string
}

export default function DealRowActions({ deal, onEdit, onDelete, className = "" }: DealRowActionsProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Desktop version with hover reveal
  const DesktopActions = () => (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center gap-1"
          >
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(deal)
              }}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-150 hover:scale-105 active:scale-95"
              title="Edit Deal"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(deal)
              }}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-150 hover:scale-105 active:scale-95"
              title="Delete Deal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback dots indicator when not hovered */}
      <AnimatePresence>
        {!isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <MoreVertical className="w-4 h-4 text-gray-300" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Mobile version with dropdown menu
  const MobileActions = () => (
    <div className="relative">
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        <MoreVertical className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[120px]"
            >
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onEdit(deal)
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onDelete(deal)
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      {/* Desktop: Hidden on mobile */}
      <div className="hidden lg:block">
        <DesktopActions />
      </div>
      
      {/* Mobile: Hidden on desktop */}
      <div className="lg:hidden">
        <MobileActions />
      </div>
    </>
  )
}