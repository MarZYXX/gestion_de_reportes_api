import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../auth_model/auth_repository.dart';
import '../auth_model/user_model.dart';

class AuthViewModel extends ChangeNotifier {
  final AuthRepository _repository = AuthRepository();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  void _setCurrentUser(UserModel? user) {
    _currentUser = user;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _setError(null);

    try {
      final userCredential = await _repository.login(email, password);
      final userModel = await _repository.loadOrCreateUserProfile(
        userCredential.user!,
      );
      _setCurrentUser(userModel);
      return true;
    } catch (e) {
      _setError(_mapLoginError(e));
      return false;
    } finally {
      _setLoading(false);
    }
  }

  String _mapLoginError(Object e) {
    if (e is FirebaseAuthException) {
      switch (e.code) {
        case 'invalid-credential':
        case 'user-not-found':
        case 'wrong-password':
          return 'Correo o contrasena incorrectos';
        case 'invalid-email':
          return 'El correo no es valido';
        case 'too-many-requests':
          return 'Demasiados intentos. Intenta mas tarde';
        default:
          return 'No fue posible iniciar sesion: ${e.code}';
      }
    }
    if (e is FirebaseException) {
      if (e.code == 'permission-denied') {
        return 'Firestore no permite leer o crear tu perfil. Revisa sus reglas.';
      }
      return 'Error de Firebase: ${e.code}';
    }
    return 'No fue posible iniciar sesion';
  }

  Future<bool> register({
    required String nombre,
    required String apellidoPaterno,
    required String apellidoMaterno,
    required String correo,
    required String contrasena,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final user = await _repository.register(
        nombre: nombre,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        correo: correo,
        contrasena: contrasena,
      );
      _setCurrentUser(user);
      return true;
    } catch (e) {
      _setError(_mapRegisterError(e));
      return false;
    } finally {
      _setLoading(false);
    }
  }

  String _mapRegisterError(Object e) {
    if (e is FirebaseAuthException) {
      switch (e.code) {
        case 'email-already-in-use':
          return 'Este correo ya esta registrado. Intenta iniciar sesion.';
        case 'invalid-email':
          return 'El correo no es valido';
        case 'weak-password':
          return 'La contrasena es demasiado debil';
        default:
          return 'No fue posible registrarse: ${e.code}';
      }
    }
    if (e is FirebaseException) {
      if (e.code == 'permission-denied') {
        return 'La cuenta no pudo guardarse en Firestore. Revisa sus reglas.';
      }
      return 'Error de Firebase: ${e.code}';
    }
    return 'No fue posible completar el registro';
  }

  Future<String?> getUserRole(String userId) {
    return _repository.getUserRole(userId);
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
