import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../model/report_model.dart';
import '../repo/reporte_service.dart';

class MapaViewModel extends ChangeNotifier {
  final ReporteService _reporteService = ReporteService();

  bool cargando = true;
  String? error;

  Position? posicionActual;
  List<ReporteModel> reportes = [];

  Function(ReporteModel)? onReportTapped;

  Future<void> inicializarMapa() async {
    try {
      cargando = true;
      error = null;
      notifyListeners();
      await _solicitarPermiso();
      posicionActual = await Geolocator.getCurrentPosition();
      await cargarReportes();
    } catch (e) {
      error = e.toString();
    } finally {
      cargando = false;
      notifyListeners();
    }
  }

  Future<void> cargarReportes() async {
    try {
      final todos = await _reporteService.obtenerTodosReportes(
        estado: 'pendiente',
      );
      reportes = todos
          .where((reporte) => !reporte.estaCompleto && !reporte.esFalso)
          .toList();
      error = null;
      notifyListeners();
    } catch (e) {
      error = e.toString();
      notifyListeners();
    }
  }

  Future<void> _solicitarPermiso() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Ubicacion desactivada');
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw Exception('Permiso de ubicacion denegado');
    }
  }

  Future<void> corroborarReporte(String reportId) async {
    try {
      await _reporteService.corroborarReporte(reportId);
      await cargarReportes();
    } catch (e) {
      error = 'Error al corroborar: $e';
      notifyListeners();
    }
  }
}
