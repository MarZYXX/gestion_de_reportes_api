import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gestion_de_reportes/model/report_model.dart';

void main() {
  test('ReporteModel genera el cuerpo REST sin campos controlados por API', () {
    final reporte = ReporteModel(
      id: 'r-1',
      userId: 'usuario-no-enviado',
      titulo: 'Bache en avenida',
      descripcion: 'Causa riesgo para vehiculos',
      severidad: 'media',
      fechaIncidente: DateTime.utc(2026, 5, 27),
      horaIncidente: const TimeOfDay(hour: 8, minute: 15),
      ubicacion: const GeoPoint(20.0, -97.0),
      urlsImagenes: const <String>[],
      contadorCorroboraciones: 0,
      corroboradoPor: const <String>[],
      estaCompleto: false,
      fechaCreacion: DateTime.utc(2026, 5, 27),
      severidadModificadaPorAdmin: false,
    );

    final json = reporte.toApiJson();

    expect(json['titulo'], 'Bache en avenida');
    expect(json['fechaIncidente'], '2026-05-27T00:00:00.000Z');
    expect(json['ubicacion'], {'latitud': 20.0, 'longitud': -97.0});
    expect(json.containsKey('userId'), isFalse);
    expect(json.containsKey('estaCompleto'), isFalse);
  });

  test('ReporteModel convierte la respuesta JSON recibida desde API', () {
    final reporte = ReporteModel.fromJson({
      'id': 'r-2',
      'userId': 'uid-servidor',
      'titulo': 'Incidente natural',
      'descripcion': 'Arbol caido',
      'severidad': 'alta',
      'fechaIncidente': '2026-05-26T00:00:00.000Z',
      'horaHora': 17,
      'horaMinuto': 40,
      'ubicacion': {'latitud': 20.5, 'longitud': -97.2},
      'urlsImagenes': <String>['evidencia'],
      'contadorCorroboraciones': 2,
      'corroboradoPor': <String>['u1', 'u2'],
      'estaCompleto': false,
      'fechaCreacion': '2026-05-27T01:00:00.000Z',
      'severidadModificadaPorAdmin': false,
      'esFalso': false,
    });

    expect(reporte.userId, 'uid-servidor');
    expect(reporte.ubicacion.latitude, 20.5);
    expect(reporte.contadorCorroboraciones, 2);
    expect(reporte.fechaCreacion, DateTime.parse('2026-05-27T01:00:00.000Z'));
  });
}
