import 'dart:convert';
import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import 'user_model.dart';

class AuthRepository {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<UserCredential> login(String email, String password) {
    return _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<String> subirImagenBase64(String uid, File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);
      final dataUrl = 'data:image/jpeg;base64,$base64Image';

      debugPrint('Tamano del Base64: ${dataUrl.length} caracteres');

      await _firestore.collection('users').doc(uid).update({
        'fotoUrl': dataUrl,
      });

      return dataUrl;
    } catch (e) {
      throw Exception('Error al guardar la imagen de perfil: $e');
    }
  }

  Future<UserModel> register({
    required String nombre,
    required String apellidoPaterno,
    required String apellidoMaterno,
    required String correo,
    required String contrasena,
  }) async {
    final userCredential = await _auth.createUserWithEmailAndPassword(
      email: correo,
      password: contrasena,
    );

    final user = UserModel(
      id: userCredential.user!.uid,
      nombre: nombre,
      apellidoPaterno: apellidoPaterno,
      apellidoMaterno: apellidoMaterno,
      correo: correo,
      role: 'usuario',
      createdAt: DateTime.now(),
    );

    try {
      await _firestore
          .collection('users')
          .doc(userCredential.user!.uid)
          .set(user.toFirestore());
    } catch (_) {
      try {
        await userCredential.user?.delete();
        await _auth.signOut();
      } catch (_) {
        // If rollback fails, login repairs this Authentication-only account.
      }
      rethrow;
    }

    return user;
  }

  Future<UserModel> loadOrCreateUserProfile(User authUser) async {
    final userRef = _firestore.collection('users').doc(authUser.uid);
    final doc = await userRef.get();

    if (doc.exists) {
      return UserModel.fromFirestore(doc, authUser.uid);
    }

    final fallbackName = (authUser.email ?? 'usuario').split('@').first.trim();
    final repairedUser = UserModel(
      id: authUser.uid,
      nombre: fallbackName.isEmpty ? 'Usuario' : fallbackName,
      apellidoPaterno: '',
      apellidoMaterno: '',
      correo: authUser.email ?? '',
      role: 'usuario',
      createdAt: DateTime.now(),
    );

    await userRef.set(repairedUser.toFirestore());
    return repairedUser;
  }

  Future<String?> getUserRole(String userId) async {
    final doc = await _firestore.collection('users').doc(userId).get();
    return doc.exists ? (doc.get('role') as String?) : null;
  }

  Future<void> actualizarPerfil({
    required String userId,
    String? telefono,
    String? domicilio,
  }) async {
    final datos = <String, dynamic>{};
    if (telefono != null) datos['telefono'] = telefono;
    if (domicilio != null) datos['domicilio'] = domicilio;

    if (datos.isNotEmpty) {
      await _firestore.collection('users').doc(userId).update(datos);
    }
  }
}
