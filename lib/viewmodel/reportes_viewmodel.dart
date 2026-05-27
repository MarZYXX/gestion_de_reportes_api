import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../model/report_model.dart';
import '../repo/reporte_service.dart';

class ReportesViewModel extends ChangeNotifier {
  final ReporteService _reporteService = ReporteService();
  final FirebaseAuth _auth = FirebaseAuth.instance;

  bool cargando = false;
  String? error;
  List<ReporteModel> reportes = [];
  String filtroActual = 'todos';
  String ordenActual = 'fecha';
  String filtroPrioridadLocal = 'todas';
  bool mostrarSoloAtendidos = false;

  Future<void> cargarReportes() async {
    try {
      cargando = true;
      error = null;
      notifyListeners();

      if (filtroActual == 'mis_reportes' && _auth.currentUser != null) {
        reportes = await _reporteService.obtenerReportesPorUsuario();
      } else if (filtroActual == 'alta' ||
          filtroActual == 'media' ||
          filtroActual == 'baja') {
        reportes = await _reporteService.obtenerReportesPorSeveridad(
          filtroActual,
        );
      } else if (ordenActual == 'corroboraciones') {
        reportes = await _reporteService
            .obtenerReportesOrdenadosPorCorroboraciones();
      } else {
        reportes = await _reporteService.obtenerTodosReportes();
      }
    } catch (e) {
      error = e.toString();
    } finally {
      cargando = false;
      notifyListeners();
    }
  }

  void cambiarFiltro(String filtro) {
    filtroActual = filtro;
    cargarReportes();
  }

  void cambiarOrden(String orden) {
    ordenActual = orden;
    cargarReportes();
  }

  Future<void> corroborarReporte(String reportId) async {
    try {
      await _reporteService.corroborarReporte(reportId);
      await cargarReportes();
    } catch (e) {
      error = e.toString();
      notifyListeners();
    }
  }

  bool usuarioYaCorroboro(ReporteModel reporte) {
    final userId = _auth.currentUser?.uid;
    if (userId == null) return false;
    return reporte.corroboradoPor.contains(userId);
  }

  List<ReporteModel> get reportesFiltrados {
    return reportes.where((r) {
      final cumplePrioridad =
          filtroPrioridadLocal == 'todas' ||
          r.severidad == filtroPrioridadLocal;
      final cumpleAtendido = mostrarSoloAtendidos ? r.estaCompleto : true;
      return cumplePrioridad && cumpleAtendido;
    }).toList();
  }

  void setFiltroPrioridadLocal(String prioridad) {
    filtroPrioridadLocal = prioridad;
    notifyListeners();
  }

  void toggleMostrarAtendidos(bool valor) {
    mostrarSoloAtendidos = valor;
    notifyListeners();
  }

  Future<void> eliminarReporteLocal(String reportId) async {
    try {
      await _reporteService.eliminarReporte(reportId);
      await cargarReportes();
    } catch (e) {
      error = e.toString();
      notifyListeners();
    }
  }
}
