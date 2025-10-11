'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchFiltersProps {
  searchParams: {
    search?: string
    category?: 'mock' | 'job' | 'all'
    type?: 'technical' | 'behavioral' | 'mixed' | 'all'
    level?: 'entry' | 'mid' | 'senior' | 'all'
  }
  totalCount: number
}

const SearchFilters = ({ searchParams, totalCount }: SearchFiltersProps) => {
  const router = useRouter()
  const params = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '')
  const [currentCategory, setCurrentCategory] = useState<'mock' | 'job' | 'all'>(searchParams.category || 'all')
  const [currentType, setCurrentType] = useState<'technical' | 'behavioral' | 'mixed' | 'all'>(searchParams.type || 'all')
  const [currentLevel, setCurrentLevel] = useState<'entry' | 'mid' | 'senior' | 'all'>(searchParams.level || 'all')
  const [isSearching, setIsSearching] = useState(false)

  // Update all states when URL params change
  useEffect(() => {
    const urlCategory = params.get('category') || 'all'
    const urlType = params.get('type') || 'all'
    const urlLevel = params.get('level') || 'all'
    const urlSearch = params.get('search') || ''

    setSearchTerm(urlSearch)
    setCurrentCategory(urlCategory as 'mock' | 'job' | 'all')
    setCurrentType(urlType as 'technical' | 'behavioral' | 'mixed' | 'all')
    setCurrentLevel(urlLevel as 'entry' | 'mid' | 'senior' | 'all')
    
    // Clear loading state when URL updates (search completed)
    setIsSearching(false)
  }, [params])

  // Extract stable values for dependencies
  const searchValue = searchParams.search || ''
  const categoryValue = searchParams.category || 'all'
  const typeValue = searchParams.type || 'all'
  const levelValue = searchParams.level || 'all'

  // Also update when searchParams prop changes (for server-side initial load)
  useEffect(() => {
    setSearchTerm(searchValue)
    setCurrentCategory(categoryValue)
    setCurrentType(typeValue)
    setCurrentLevel(levelValue)
  }, [searchValue, categoryValue, typeValue, levelValue])

  // Debounced search with properly synchronized loading state
  useEffect(() => {
    const currentSearch = params.get('search') || ''
    
    // Only show loading if search term is different and not empty
    if (searchTerm !== currentSearch && searchTerm.trim() !== '') {
      setIsSearching(true)
    } else if (searchTerm.trim() === '' && currentSearch === '') {
      setIsSearching(false)
    }

    const timer = setTimeout(() => {
      // Only update URL if the search term actually changed from what's in the URL
      if (searchTerm !== currentSearch) {
        const current = new URLSearchParams(Array.from(params.entries()))
        
        if (searchTerm.trim() === '') {
          current.delete('search')
        } else {
          current.set('search', searchTerm.trim())
        }
        
        const search = current.toString()
        const query = search ? `?${search}` : ''
        router.push(`/discover${query}`)
      }
      // Always clear loading state when debounce completes
      setIsSearching(false)
    }, 2000) // 2 seconds debounce

    return () => {
      clearTimeout(timer)
      // Don't clear loading state in cleanup - let it complete naturally
    }
  }, [searchTerm, params, router])

  const updateFilter = (key: string, value: string) => {
    // Update local state immediately with proper typing
    if (key === 'category') setCurrentCategory(value as 'mock' | 'job' | 'all')
    if (key === 'type') setCurrentType(value as 'technical' | 'behavioral' | 'mixed' | 'all')
    if (key === 'level') setCurrentLevel(value as 'entry' | 'mid' | 'senior' | 'all')
    
    const current = new URLSearchParams(Array.from(params.entries()))
    
    if (value === 'all' || value === '') {
      current.delete(key)
    } else {
      current.set(key, value)
    }
    
    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`/discover${query}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCurrentCategory('all')
    setCurrentType('all')
    setCurrentLevel('all')
    router.push('/discover')
  }

  // Static placeholder text for search input
  const getSearchPlaceholder = () => {
    return 'Search by role...'
  }

  return (
    <div className="card-border w-full mb-8">
      <div className="dark-gradient rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-primary-100">Filter Interviews</h2>
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="text-sm border-primary-500/30 text-primary-200 hover:bg-primary-500/20"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary-300">
              Search Roles
            </label>
            <div className="relative">
              <Input
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 px-4 bg-dark-200 border-primary-500/30 text-primary-100 placeholder:text-light-400 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary-300">
              Category
            </label>
            <select
              value={currentCategory}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full h-12 px-4 bg-dark-200 border border-primary-500/30 text-primary-100 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            >
              <option value="all" className="bg-dark-200 text-primary-100">All Categories</option>
              <option value="mock" className="bg-dark-200 text-primary-100">Mock Interviews</option>
              <option value="job" className="bg-dark-200 text-primary-100">Job Interviews</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary-300">
              Interview Type
            </label>
            <select
              value={currentType}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full h-12 px-4 bg-dark-200 border border-primary-500/30 text-primary-100 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            >
              <option value="all" className="bg-dark-200 text-primary-100">All Types</option>
              <option value="technical" className="bg-dark-200 text-primary-100">Technical</option>
              <option value="behavioral" className="bg-dark-200 text-primary-100">Behavioral</option>
              <option value="mixed" className="bg-dark-200 text-primary-100">Mixed</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary-300">
              Experience Level
            </label>
            <select
              value={currentLevel}
              onChange={(e) => updateFilter('level', e.target.value)}
              className="w-full h-12 px-4 bg-dark-200 border border-primary-500/30 text-primary-100 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            >
              <option value="all" className="bg-dark-200 text-primary-100">All Levels</option>
              <option value="entry" className="bg-dark-200 text-primary-100">Entry Level</option>
              <option value="mid" className="bg-dark-200 text-primary-100">Mid Level</option>
              <option value="senior" className="bg-dark-200 text-primary-100">Senior Level</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchFilters
