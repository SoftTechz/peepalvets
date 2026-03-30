from __future__ import annotations

import io
from datetime import UTC, date, datetime
from html import escape
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from weasyprint import HTML

from app.core.firebase import get_firestore

router = APIRouter()


REPORT_COLUMNS = [
    ("Owner Name", "customerName"),
    ("Phone Number", "phone"),
    ("Pet Name", "petName"),
    ("Pet Type", "petType"),
    ("Appointment Date", "date"),
    ("Doctor Fee", "doctorFee"),
    ("Status", "status"),
]


def _parse_iso_date(value: str | None, field_name: str) -> date | None:
    if value is None:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as exc:
        raise HTTPException(
            status_code=422, detail=f"Invalid {field_name}. Expected YYYY-MM-DD."
        ) from exc


def _build_filters(from_date: date | None, to_date: date | None):
    filters: list[tuple[str, str, str]] = []
    if from_date:
        filters.append(("date", ">=", from_date.isoformat()))
    if to_date:
        filters.append(("date", "<=", to_date.isoformat()))
    return filters


def _apply_filters(query, filters: list[tuple[str, str, str]]):
    for field_name, operator, value in filters:
        query = query.where(field_name, operator, value)
    return query


def _normalize_report_row(doc) -> dict[str, Any]:
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "customerName": data.get("customerName") or "-",
        "phone": data.get("phone") or "-",
        "petName": data.get("petName") or "-",
        "petType": data.get("petType") or "-",
        "date": data.get("date") or "-",
        "doctorFee": data.get("doctorFee") or 0,
        "status": (data.get("status") or "active"),
    }


def _fetch_all_filtered_appointments(
    db, from_date: date | None, to_date: date | None
) -> list[dict[str, Any]]:
    filters = _build_filters(from_date, to_date)
    query = db.collection("appointments")
    query = _apply_filters(query, filters)
    query = query.order_by("date", direction="DESCENDING").order_by(
        "created_at", direction="DESCENDING"
    )

    docs = list(query.stream())
    return [_normalize_report_row(doc) for doc in docs]


def _date_range_label(from_date: date | None, to_date: date | None) -> str:
    if from_date and to_date:
        return f"{from_date.isoformat()} to {to_date.isoformat()}"
    if from_date:
        return f"From {from_date.isoformat()}"
    if to_date:
        return f"Up to {to_date.isoformat()}"
    return "All dates"


def _extract_count_value(raw_count_result: Any) -> int:
    """
    Firestore aggregation responses can vary by SDK/runtime version.
    Handle value shapes safely:
    - object with `.value`
    - dict with `value`
    - list/tuple nesting
    - plain int
    """
    current = raw_count_result

    while isinstance(current, (list, tuple)):
        if not current:
            return 0
        current = current[0]

    if isinstance(current, dict):
        return int(current.get("value", 0) or 0)

    if hasattr(current, "value"):
        return int(getattr(current, "value") or 0)

    try:
        return int(current or 0)
    except (TypeError, ValueError):
        return 0


@router.get("/appointments")
def get_appointments_report(
    from_date: str | None = Query(default=None),
    to_date: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    cursor: str | None = Query(default=None),
):
    parsed_from = _parse_iso_date(from_date, "from_date")
    parsed_to = _parse_iso_date(to_date, "to_date")

    if parsed_from and parsed_to and parsed_from > parsed_to:
        raise HTTPException(
            status_code=422, detail="from_date must be less than or equal to to_date."
        )

    db = get_firestore()
    appointments_ref = db.collection("appointments")
    filters = _build_filters(parsed_from, parsed_to)

    count_query = _apply_filters(appointments_ref, filters)
    count_snapshot = count_query.count().get()
    total = _extract_count_value(count_snapshot)

    query = _apply_filters(appointments_ref, filters)
    query = query.order_by("date", direction="DESCENDING").order_by(
        "created_at", direction="DESCENDING"
    )

    if cursor:
        cursor_doc = appointments_ref.document(cursor).get()
        if cursor_doc.exists:
            query = query.start_after(cursor_doc)

    docs = list(query.limit(limit + 1).stream())
    has_next = len(docs) > limit
    selected_docs = docs[:limit] if has_next else docs
    appointments = [_normalize_report_row(doc) for doc in selected_docs]
    next_cursor = selected_docs[-1].id if has_next and selected_docs else None

    return {
        "appointments": appointments,
        "limit": limit,
        "next_cursor": next_cursor,
        "has_next": has_next,
        "total": total,
    }


@router.get("/appointments/export/excel")
def export_appointments_report_excel(
    from_date: str | None = Query(default=None),
    to_date: str | None = Query(default=None),
):
    parsed_from = _parse_iso_date(from_date, "from_date")
    parsed_to = _parse_iso_date(to_date, "to_date")

    if parsed_from and parsed_to and parsed_from > parsed_to:
        raise HTTPException(
            status_code=422, detail="from_date must be less than or equal to to_date."
        )

    db = get_firestore()
    appointments = _fetch_all_filtered_appointments(db, parsed_from, parsed_to)
    date_range = _date_range_label(parsed_from, parsed_to)

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Appointments Report"

    sheet.append(["Appointments Report"])
    sheet.append([f"Date Range: {date_range}"])
    sheet.append([f"Total Appointments: {len(appointments)}"])
    sheet.append([])
    sheet.append([column_title for column_title, _ in REPORT_COLUMNS])

    for appointment in appointments:
        row = []
        for _, key in REPORT_COLUMNS:
            value = appointment.get(key)
            if key == "doctorFee":
                try:
                    value = float(value or 0)
                except (TypeError, ValueError):
                    value = 0
            row.append(value if value is not None else "-")
        sheet.append(row)

    for column_cells in sheet.columns:
        max_len = 0
        column_letter = column_cells[0].column_letter
        for cell in column_cells:
            value = "" if cell.value is None else str(cell.value)
            max_len = max(max_len, len(value))
        sheet.column_dimensions[column_letter].width = min(max(max_len + 2, 14), 40)

    output = io.BytesIO()
    workbook.save(output)
    output.seek(0)

    filename = f"appointments_report_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/appointments/export/pdf")
def export_appointments_report_pdf(
    from_date: str | None = Query(default=None),
    to_date: str | None = Query(default=None),
):
    parsed_from = _parse_iso_date(from_date, "from_date")
    parsed_to = _parse_iso_date(to_date, "to_date")

    if parsed_from and parsed_to and parsed_from > parsed_to:
        raise HTTPException(
            status_code=422, detail="from_date must be less than or equal to to_date."
        )

    db = get_firestore()
    appointments = _fetch_all_filtered_appointments(db, parsed_from, parsed_to)
    date_range = _date_range_label(parsed_from, parsed_to)
    generated_on = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S UTC")

    table_header_html = "".join(
        f"<th>{escape(column_title)}</th>" for column_title, _ in REPORT_COLUMNS
    )
    table_rows_html = "".join(
        "<tr>"
        + "".join(
            f"<td>{escape(str(appointment.get(key, '-') if key != 'doctorFee' else appointment.get(key, 0)))}</td>"
            for _, key in REPORT_COLUMNS
        )
        + "</tr>"
        for appointment in appointments
    )
    if not table_rows_html:
        table_rows_html = (
            '<tr><td colspan="7" style="text-align:center;">No appointments found</td></tr>'
        )

    html = f"""
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page {{
            size: A4 landscape;
            margin: 16mm;
          }}
          body {{
            font-family: Arial, sans-serif;
            color: #111827;
            font-size: 11px;
          }}
          h1 {{
            margin: 0 0 8px 0;
            font-size: 20px;
          }}
          .meta {{
            margin: 4px 0;
            font-size: 12px;
          }}
          table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
          }}
          th, td {{
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }}
          th {{
            background: #f3f4f6;
            font-weight: 700;
          }}
        </style>
      </head>
      <body>
        <h1>Appointments Report</h1>
        <p class="meta"><strong>Date Range:</strong> {escape(date_range)}</p>
        <p class="meta"><strong>Total Appointments:</strong> {len(appointments)}</p>
        <p class="meta"><strong>Generated On:</strong> {escape(generated_on)}</p>
        <table>
          <thead>
            <tr>{table_header_html}</tr>
          </thead>
          <tbody>
            {table_rows_html}
          </tbody>
        </table>
      </body>
    </html>
    """

    pdf_bytes = HTML(string=html).write_pdf()
    filename = f"appointments_report_{datetime.now(UTC).strftime('%Y%m%d_%H%M%S')}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
