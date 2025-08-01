interface Product {
  productCode: string
  grade: string
  company: string
  specificGrade: string
}

interface SearchableProductOption {
  value: string
  label: string
  details: string
  searchableFields: {
    grade: string
    company: string
    specificGrade: string
  }
}

export const createSearchableProductOptions = (products: Product[]): SearchableProductOption[] => {
  return products.map(product => ({
    value: product.productCode,
    label: product.productCode,
    details: `${product.grade} | ${product.company} | ${product.specificGrade}`,
    searchableFields: {
      grade: product.grade,
      company: product.company,
      specificGrade: product.specificGrade
    }
  }))
}

export const filterProductsBySearch = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm.trim()) return products
  
  const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0)
  
  return products.filter(product => {
    const searchableText = [
      product.productCode.toLowerCase(),
      product.grade.toLowerCase(),
      product.company.toLowerCase(),
      product.specificGrade.toLowerCase()
    ].join(' ')
    
    return searchWords.every(word => searchableText.includes(word))
  })
}