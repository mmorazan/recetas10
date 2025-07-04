import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, BookOpen } from 'lucide-react'

interface Recipe {
  id_receta: number
  nombre: string
  descripcion: string
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  })

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes.php?action=getAll')
      const data = await response.json()
      if (data.success) {
        setRecipes(data.data)
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formDataToSend = new FormData()
    formDataToSend.append('action', editingRecipe ? 'update' : 'add')
    formDataToSend.append('nombre', formData.nombre)
    formDataToSend.append('descripcion', formData.descripcion)
    
    if (editingRecipe) {
      formDataToSend.append('id_receta', editingRecipe.id_receta.toString())
    }

    try {
      const response = await fetch('/api/recipes.php', {
        method: 'POST',
        body: formDataToSend
      })
      
      const data = await response.json()
      if (data.success) {
        fetchRecipes()
        setShowModal(false)
        setEditingRecipe(null)
        setFormData({ nombre: '', descripcion: '' })
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      alert('Error al guardar la receta')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) return

    const formData = new FormData()
    formData.append('action', 'delete')
    formData.append('id_receta', id.toString())

    try {
      const response = await fetch('/api/recipes.php', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        fetchRecipes()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Error al eliminar la receta')
    }
  }

  const openModal = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe)
      setFormData({
        nombre: recipe.nombre,
        descripcion: recipe.descripcion
      })
    } else {
      setEditingRecipe(null)
      setFormData({ nombre: '', descripcion: '' })
    }
    setShowModal(true)
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recetas</h2>
          <p className="mt-2 text-gray-600">Gestiona tus recetas de cocina</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Receta</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar recetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id_receta} className="card">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {recipe.nombre}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {recipe.descripcion}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ID: {recipe.id_receta}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => openModal(recipe)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(recipe.id_receta)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron recetas</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRecipe ? 'Editar Receta' : 'Nueva Receta'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input-field"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingRecipe ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}