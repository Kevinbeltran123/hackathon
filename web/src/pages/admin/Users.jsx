// Admin users management page
import React, { useState, useEffect } from 'react'
import { updateUserRole } from '../../lib/auth'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)

  useEffect(() => {
    // Simulate loading users
    const mockUsers = [
      {
        id: 'user_1',
        email: 'maria@email.com',
        fullName: 'María García',
        role: 'user',
        isAdmin: false,
        status: 'active',
        joinDate: '2024-01-15T10:00:00Z',
        lastLogin: '2024-01-20T14:30:00Z',
        checkIns: 12,
        points: 450,
        coupons: 3
      },
      {
        id: 'user_2',
        email: 'carlos@email.com',
        fullName: 'Carlos López',
        role: 'user',
        isAdmin: false,
        status: 'active',
        joinDate: '2024-01-10T14:30:00Z',
        lastLogin: '2024-01-19T09:15:00Z',
        checkIns: 8,
        points: 320,
        coupons: 2
      },
      {
        id: 'user_3',
        email: 'admin@rutasvivas.com',
        fullName: 'Administrador',
        role: 'admin',
        isAdmin: true,
        status: 'active',
        joinDate: '2024-01-01T00:00:00Z',
        lastLogin: '2024-01-20T16:45:00Z',
        checkIns: 0,
        points: 0,
        coupons: 0
      },
      {
        id: 'user_4',
        email: 'ana@email.com',
        fullName: 'Ana Rodríguez',
        role: 'user',
        isAdmin: false,
        status: 'suspended',
        joinDate: '2024-01-05T09:15:00Z',
        lastLogin: '2024-01-18T11:20:00Z',
        checkIns: 5,
        points: 180,
        coupons: 1
      }
    ]

    setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  const filters = [
    { id: 'all', name: 'Todos', count: 0 },
    { id: 'active', name: 'Activos', count: 0 },
    { id: 'suspended', name: 'Suspendidos', count: 0 },
    { id: 'admin', name: 'Administradores', count: 0 },
  ]

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && user.status === 'active') ||
                         (filter === 'suspended' && user.status === 'suspended') ||
                         (filter === 'admin' && user.isAdmin)
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await updateUserRole(userId, newRole)
      if (error) {
        console.error('Error updating role:', error)
        return
      }

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, isAdmin: newRole === 'admin' }
          : user
      ))
      setShowRoleModal(false)
    } catch (err) {
      console.error('Error updating role:', err)
    }
  }

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: newStatus }
        : user
    ))
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(prev => prev.filter(user => user.id !== userId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocobo mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y roles del sistema</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredUsers.length} usuarios encontrados
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-forest">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center">
              <span className="text-white text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-forest">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-forest">
                {users.filter(u => u.isAdmin).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-forest to-forest2 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">👑</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspendidos</p>
              <p className="text-2xl font-bold text-forest">
                {users.filter(u => u.status === 'suspended').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🚫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocobo/50 focus:border-ocobo"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === filterOption.id
                    ? 'bg-gradient-to-r from-ocobo to-gold text-white shadow-glow-ocobo'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.name} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-ocobo to-gold rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-forest">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.isAdmin ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{user.checkIns}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span>{user.points}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.lastLogin).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowRoleModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        👑 Cambiar Rol
                      </button>
                      <button
                        onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                        className={user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                      >
                        {user.status === 'active' ? '🚫 Suspender' : '✅ Activar'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay usuarios con este filtro'}
          </p>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-forest">Cambiar Rol</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Cambiar rol de <strong>{selectedUser.fullName}</strong> ({selectedUser.email})
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleChange(selectedUser.id, 'user')}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedUser.role === 'user' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium">Usuario</div>
                  <div className="text-sm text-gray-600">Acceso a funciones básicas</div>
                </button>
                <button
                  onClick={() => handleRoleChange(selectedUser.id, 'admin')}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedUser.role === 'admin' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-medium">Administrador</div>
                  <div className="text-sm text-gray-600">Acceso completo al sistema</div>
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
