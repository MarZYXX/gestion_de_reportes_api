import 'package:cloud_firestore/cloud_firestore.dart';

import '../model/comentario_model.dart';
import '../model/report_model.dart';
import 'api_client.dart';

class ReporteService {
  final ApiClient _api;

  ReporteService({ApiClient? api}) : _api = api ?? ApiClient();

  Future<void> crearReporte(ReporteModel reporte) async {
    await _api.post('/reportes', body: reporte.toApiJson());
  }

  Future<List<ReporteModel>> obtenerReportesPorUsuario([String? userId]) async {
    final data = await _api.get('/reportes/mios') as List<dynamic>;
    return _toReports(data);
  }

  Future<List<ReporteModel>> obtenerTodosReportes({
    String? severidad,
    String? estado,
    String? orden,
  }) async {
    final query = <String, String>{
      if (severidad != null) 'severidad': severidad,
      if (estado != null) 'estado': estado,
      if (orden != null) 'orden': orden,
    };
    final data = await _api.get('/reportes', query: query) as List<dynamic>;
    return _toReports(data);
  }

  Future<List<ReporteModel>> obtenerReportesPorSeveridad(String severidad) {
    return obtenerTodosReportes(severidad: severidad);
  }

  Future<List<ReporteModel>> obtenerReportesOrdenadosPorCorroboraciones() {
    return obtenerTodosReportes(orden: 'corroboraciones');
  }

  Future<ReporteModel> obtenerReporte(String reportId) async {
    final data = await _api.get('/reportes/$reportId') as Map<String, dynamic>;
    return ReporteModel.fromJson(data);
  }

  Future<void> corroborarReporte(String reportId, [String? userId]) async {
    await _api.post('/reportes/$reportId/corroborar');
  }

  Future<void> actualizarSeveridad(
    String reportId,
    String nuevaSeveridad,
  ) async {
    await _api.patch(
      '/admin/reportes/$reportId/severidad',
      body: {'severidad': nuevaSeveridad},
    );
  }

  Future<void> eliminarReporte(String reportId) async {
    await _api.delete('/reportes/$reportId');
  }

  Future<void> actualizarReporte(
    String reportId,
    Map<String, dynamic> dataActualizada,
  ) async {
    final data = Map<String, dynamic>.from(dataActualizada);
    final fecha = data['fechaIncidente'];
    if (fecha is Timestamp) {
      data['fechaIncidente'] = fecha.toDate().toUtc().toIso8601String();
    } else if (fecha is DateTime) {
      data['fechaIncidente'] = fecha.toUtc().toIso8601String();
    }
    await _api.patch('/reportes/$reportId', body: data);
  }

  Future<void> marcarComoCompletado(String reportId) async {
    await _api.patch('/admin/reportes/$reportId/resolver');
  }

  Future<void> agregarComentario(
    String reportId,
    String userId,
    String texto,
  ) async {
    await _api.post('/reportes/$reportId/comentarios', body: {'texto': texto});
  }

  Future<List<ComentarioModel>> obtenerComentarios(String reportId) async {
    final data =
        await _api.get('/reportes/$reportId/comentarios') as List<dynamic>;
    return data
        .map((item) => ComentarioModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> actualizarComentario(
    String reportId,
    String comentarioId,
    String nuevoTexto,
  ) async {
    await _api.patch(
      '/reportes/$reportId/comentarios/$comentarioId',
      body: {'texto': nuevoTexto},
    );
  }

  Future<void> eliminarComentario(String reportId, String comentarioId) async {
    await _api.delete('/reportes/$reportId/comentarios/$comentarioId');
  }

  Future<void> marcarComoFalso(String reportId) async {
    await _api.patch('/admin/reportes/$reportId/falso');
  }

  Future<Map<String, dynamic>> obtenerCiudadanoAdmin(String userId) async {
    return await _api.get('/admin/usuarios/$userId') as Map<String, dynamic>;
  }

  List<ReporteModel> _toReports(List<dynamic> data) {
    return data
        .map((item) => ReporteModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
