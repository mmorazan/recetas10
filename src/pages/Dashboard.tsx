import React, { useState, useEffect } from 'react'
import { Package, BookOpen, Tag, TrendingUp } from 'lucide-react'

interface Stats {
  totalIngredients: number
  totalRecipes: number
  totalCategories: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalIngredients: 0,
    totalRecipes: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ingredientsRes, recipesRes, categoriesRes] = await Promise.all([
          fetch('/api/ingredients.php?action=getAll'),
          fetch('/api/recipes.php?action=getAll'),
          fetch('/api/categories.php?action=getAll')
        ])

        const [ingredients, recipes, categories] = await Promise.all([
          ingredientsRes.json(),
          recipesRes.json(),
          categoriesRes.json()
        ])

        setStats({
          totalIngredients: ingredients.success ? ingredients.data.length : 0,
          totalRecipes: recipes.success ? recipes.data.length : 0,
          totalCategories: categories.success ? categories.data.length : 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      name: 'Total Ingredientes',
      value: stats.totalIngredients,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Total Recetas',
      value: stats.totalRecipes,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Total Categorías',
      value: stats.totalCategories,
      icon: Tag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Reportes Disponibles',
      value: 1,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">
          Resumen general del sistema de gestión de recetas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Welcome Section */}
      <div className="card">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bienvenido al Sistema de Gestión de Recetas
          </h3>
          <p className="text-gray-600 mb-6">
            Administra tus ingredientes, categorías, recetas y genera reportes detallados 
            para optimizar tu cocina.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Ingredientes</h4>
              <p className="text-sm text-gray-600">Gestiona tu inventario</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Tag className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Categorías</h4>
              <p className="text-sm text-gray-600">Organiza por tipos</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Recetas</h4>
              <p className="text-sm text-gray-600">Crea y administra</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">Reportes</h4>
              <p className="text-sm text-gray-600">Analiza el uso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}