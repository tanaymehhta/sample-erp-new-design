import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../utils/cn'

interface Option {
  value: string
  label: string
  details?: string
}

interface AutoCompleteProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: string
  label?: string
  required?: boolean
}

export default function AutoComplete({
  options,
  value,
  onChange,
  placeholder = "Type to search...",
  className,
  error,
  label,
  required
}: AutoCompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt.value === value)
      const newSearchTerm = selectedOption?.label || value
      if (searchTerm !== newSearchTerm) {
        setSearchTerm(newSearchTerm)
      }
    } else if (searchTerm !== '') {
      setSearchTerm('')
    }
  }, [value]) // Remove options from dependency array

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsOpen(true)
    setHighlightedIndex(-1)
    
    // If exact match, select it
    const exactMatch = options.find(opt => 
      opt.label.toLowerCase() === newValue.toLowerCase()
    )
    if (exactMatch && exactMatch.value !== value) {
      onChange(exactMatch.value)
    } else if (!exactMatch && newValue !== value) {
      onChange(newValue)
    }
  }

  const handleOptionSelect = (option: Option) => {
    onChange(option.value)
    setSearchTerm(option.label)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true)
        return
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "input-field pr-10",
            error && "border-red-500 focus:ring-red-500",
            "transition-all duration-200"
          )}
        />
        
        <motion.div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          >
            <ul ref={listRef} className="py-2">
              {filteredOptions.map((option, index) => (
                <motion.li
                  key={option.value}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors duration-150",
                    "hover:bg-gray-50 flex items-center justify-between",
                    highlightedIndex === index && "bg-primary-50 text-primary-700",
                    value === option.value && "bg-primary-100 text-primary-800"
                  )}
                >
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.details && (
                      <div className="text-sm text-gray-500 mt-1">
                        {option.details}
                      </div>
                    )}
                  </div>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}