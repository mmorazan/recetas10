import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react'

interface Ingredient {
  id_ingrediente: number
  nombre: string
  presentacion: string
  precio_compra: number
  id_proveedor: number | null
  id_categoria: number | null
  imagen: string | null
  categoria_nombre?: string
  proveedor_nombre?: string
}

interface Category {
  id_categoria: number
  nombre: string
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    presentacion: '',
    precio_compra: '',
    id_categoria: '',
    imagen: null as File | null
  })

  useEffect(() => {
    fetchIngredients()
    fetchCategories()
  }, [])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients.php?action=getAll')
      const data = await response.json()
      if (data.success) {
        setIngredients(data.data)
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories.php?action=getAll')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formDataToSend = new FormData()
    formDataToSend.append('action', editingIngredient ? 'update' : 'add')
    formDataToSend.append('nombre', formData.nombre)
    formDataToSend.append('presentacion', formData.presentacion)
    formDataToSend.append('precio_compra', formData.precio_compra)
    formDataToSend.append('id_categoria', formData.id_categoria)
    
    if (formData.imagen) {
      formDataToSend.append('imagen', formData.imagen)
    }
    
    if (editingIngredient) {
      formDataToSend.append('id_ingrediente', editingIngredient.id_ingrediente.toString())
      if (editingIngredient.imagen) {
        formDataToSend.append('current_imagen', editingIngredient.imagen)
      }
    }

    try {
      const response = await fetch('/api/ingredients.php', {
        method: 'POST',
        body: formDataToSend
      })
      
      const data = await response.json()
      if (data.success) {
        fetchIngredients()
        setShowModal(false)
        setEditingIngredient(null)
        setFormData({
          nombre: '',
          presentacion: '',
          precio_compra: '',
          id_categoria: '',
          imagen: null
        })
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error saving ingredient:', error)
      alert('Error al guardar el ingrediente')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ingrediente?')) return

    const formData = new FormData()
    formData.append('action', 'delete')
    formData.append('id_ingrediente', id.toString())

    try {
      const response = await fetch('/api/ingredients.php', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (data.success) {
        fetchIngredients()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error)
      alert('Error al eliminar el ingrediente')
    }
  }

  const openModal = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient)
      setFormData({
        nombre: ingredient.nombre,
        presentacion: ingredient.presentacion,
        precio_compra: ingredient.precio_compra.toString(),
        id_categoria: ingredient.id_categoria?.toString() || '',
        imagen: null
      })
    } else {
      setEditingIngredient(null)
      setFormData({
        nombre: '',
        presentacion: '',
        precio_compra: '',
        id_categoria: '',
        imagen: null
      })
    }
    setShowModal(true)
  }

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.presentacion.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className="text-2xl font-bold text-gray-900">Ingredientes</h2>
          <p className="mt-2 text-gray-600">Gestiona tu inventario de ingredientes</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Ingrediente</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar ingredientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIngredients.map((ingredient) => (
          <div key={ingredient.id_ingrediente} className="card">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {ingredient.imagen ? (
                  <img
                    src={`/uploads/ingredientes/${ingredient.imagen}`}
                    alt={ingredient.nombre}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {ingredient.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {ingredient.presentacion}
                </p>
                <p className="text-sm font-medium text-green-600 mb-1">
                  ${ingredient.precio_compra}
                </p>
                {ingredient.categoria_nombre && (
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {ingredient.categoria_nombre}
                  </span>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => openModal(ingredient)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(ingredient.id_ingrediente)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron ingredientes</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingIngredient ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
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
                  Presentación
                </label>
                <input
                  type="text"
                  value={formData.presentacion}
                  onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Compra
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio_compra}
                  onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={formData.id_categoria}
                  onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.id_categoria} value={category.id_categoria}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, imagen: e.target.files?.[0] || null })}
                  className="input-field"
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
                  {editingIngredient ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}