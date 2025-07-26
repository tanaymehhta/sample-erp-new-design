import { BaseEntity } from '../../../shared/types/api'

export interface Customer extends BaseEntity {
  partyName: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
}

export interface Supplier extends BaseEntity {
  partyName: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
}

export interface Product extends BaseEntity {
  productCode: string
  grade: string
  company: string
  specificGrade: string
  source?: string
}

export interface CreateCustomerRequest {
  partyName: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
}

export interface CreateSupplierRequest {
  partyName: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
}

export interface CreateProductRequest {
  productCode: string
  grade: string
  company: string
  specificGrade: string
}