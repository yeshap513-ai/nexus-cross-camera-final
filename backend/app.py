import os
import glob
from pathlib import Path
import streamlit as st
import folium
from streamlit_folium import st_folium

from config import (
    BASE_DIR,
    SNAPSHOT_DIR,
    OUTPUT_DIR,
    LOCAL_CAMERAS,
    WATCHLIST,
)
from database import (
    init_db,
    get_connection,
    get_all_detections,
    get_all_alerts,
    export_detections_csv,
)
from correlation import correlate_by_plate, correlate_by_visual

# Initialize database
init_db()

# Page config
st.set_page_config(
    page_title="NEXUS — Cross-Camera Intelligence Command Center",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Professional Minimal Tactical CSS
st.markdown("""
<style>
    /* Dark Operational Police Theme */
    .stApp {
        background-color: #0b0f17;
        color: #e6edf3;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Header Area */
    .nexus-header {
        border-bottom: 1px solid #21262d;
        padding-bottom: 16px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .nexus-title {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: #ffffff;
        margin: 0;
    }
    .nexus-subtitle {
        font-size: 13px;
        color: #8b949e;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-top: 4px;
    }
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background-color: #0d1f17;
        border: 1px solid #238636;
        color: #3fb950;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #3fb950;
    }
    
    /* Section Headings */
    .section-title {
        font-size: 16px;
        font-weight: 700;
        color: #f0f6fc;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-top: 20px;
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid #21262d;
    }
    
    /* Clean Cards */
    .nexus-card {
        background-color: #161b22;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 14px 16px;
        margin-bottom: 12px;
    }
    
    /* Alert Card */
    .alert-card {
        background-color: #1a0f12;
        border: 1px solid #da3633;
        border-left: 5px solid #f85149;
        border-radius: 6px;
        padding: 12px 14px;
        margin-bottom: 10px;
    }
    .alert-title {
        color: #ff7b72;
        font-weight: 700;
        font-size: 14px;
    }
    .alert-meta {
        color: #c9d1d9;
        font-size: 12px;
        margin-top: 4px;
    }
    
    /* Route Hop Breadcrumb */
    .hop-breadcrumb {
        background-color: #0d1117;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 12px 16px;
        font-size: 15px;
        font-weight: 700;
        color: #58a6ff;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .hop-arrow {
        color: #8b949e;
        font-size: 14px;
    }
    
    /* Confidence Labels */
    .badge-high {
        background-color: #0d1f17;
        color: #3fb950;
        border: 1px solid #238636;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
    }
    .badge-low {
        background-color: #271c0c;
        color: #d29922;
        border: 1px solid #9e6a03;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
    }
</style>
""", unsafe_allow_html=True)

# ----------------------------------------------------
# 1. HEADER & SYSTEM STATUS
# ----------------------------------------------------
conn = get_connection()
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM detections")
total_detections = c.fetchone()[0]

c.execute("SELECT COUNT(*) FROM alerts")
total_alerts = c.fetchone()[0]

# Query real target object counts from SQLite
target_classes = ["person", "bicycle", "car", "motorcycle", "bus", "truck", "backpack", "handbag"]
c.execute("SELECT object_class, COUNT(*) FROM detections GROUP BY object_class")
detected_class_counts = dict(c.fetchall())

# Camera alert lookup (does camera have alerts?)
c.execute("SELECT DISTINCT camera_id FROM alerts")
cameras_with_alerts = set(r[0] for r in c.fetchall())

# Camera detection counts lookup
c.execute("SELECT camera_id, COUNT(*) FROM detections GROUP BY camera_id")
camera_detection_counts = dict(c.fetchall())

# Camera most recent detection
c.execute("""
    SELECT d1.camera_id, d1.object_class, d1.timestamp_iso, d1.plate_text
    FROM detections d1
    INNER JOIN (
        SELECT camera_id, MAX(id) as max_id FROM detections GROUP BY camera_id
    ) d2 ON d1.id = d2.max_id
""")
camera_last_detections = {r[0]: (r[1], r[2], r[3]) for r in c.fetchall()}

conn.close()

st.markdown("""
<div class="nexus-header">
    <div>
        <div class="nexus-title">NEXUS</div>
        <div class="nexus-subtitle">Cross-Camera Intelligence Command Center</div>
    </div>
    <div style="display: flex; align-items: center; gap: 16px;">
        <div class="status-badge">
            <div class="status-dot"></div>
            <span>SYSTEM ONLINE — 4/4 CAMERAS</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Top Telemetry Cards
col_m1, col_m2, col_m3, col_m4, col_m5 = st.columns(5)
with col_m1:
    st.metric("Total Detections", total_detections)
with col_m2:
    st.metric("Active Alerts", total_alerts)
with col_m3:
    st.metric("Cameras Monitored", len(LOCAL_CAMERAS))
with col_m4:
    vehicles_count = sum(detected_class_counts.get(k, 0) for k in ["car", "motorcycle", "bus", "truck"])
    st.metric("Vehicles Detected", vehicles_count)
with col_m5:
    st.metric("Persons Detected", detected_class_counts.get("person", 0))

# ----------------------------------------------------
# 2. CAMERA MONITORING & 3. ACTIVE ALERTS (Side-by-side or stacked)
# ----------------------------------------------------
st.markdown('<div class="section-title">1. Camera Monitoring Grid</div>', unsafe_allow_html=True)

cam_cols = st.columns(4)
for idx, cam in enumerate(LOCAL_CAMERAS):
    cam_id = cam["id"]
    cam_name = cam["name"]
    cam_lat = cam["latitude"]
    cam_lon = cam["longitude"]
    det_count = camera_detection_counts.get(cam_id, 0)
    has_alert = cam_id in cameras_with_alerts
    last_det = camera_last_detections.get(cam_id)
    
    with cam_cols[idx]:
        st.markdown(f"**{cam_id}: {cam_name}**")
        st.caption(f"GPS: {cam_lat:.4f} N, {cam_lon:.4f} E")
        
        # Actual processed video from output_videos/
        annotated_path = OUTPUT_DIR / f"annotated_{cam_id}.mp4"
        if annotated_path.exists():
            st.video(str(annotated_path))
        else:
            st.info("Processed video not found.")
            
        # Telemetry info
        alert_str = "🚨 ALERT ACTIVE" if has_alert else "NORMAL"
        alert_color = "#ff7b72" if has_alert else "#3fb950"
        
        last_str = f"{last_det[0].upper()}" if last_det else "None"
        if last_det and last_det[2]:
            last_str += f" ({last_det[2]})"
            
        st.markdown(f"""
        <div style="font-size: 12px; color: #8b949e; line-height: 1.5; margin-top: 4px;">
            Detections: <b style="color: #c9d1d9;">{det_count}</b><br>
            Latest: <b style="color: #c9d1d9;">{last_str}</b><br>
            Status: <b style="color: {alert_color};">{alert_str}</b>
        </div>
        """, unsafe_allow_html=True)

# ----------------------------------------------------
# 3. ACTIVE ALERTS
# ----------------------------------------------------
st.markdown('<div class="section-title">2. Active Watchlist Alerts (Real-Time Database Log)</div>', unsafe_allow_html=True)

alerts = get_all_alerts(limit=6)
if not alerts:
    st.info("No active watchlist matches currently in database.")
else:
    alert_cols = st.columns(3)
    for idx, alert in enumerate(alerts[:6]):
        col_idx = idx % 3
        with alert_cols[col_idx]:
            plate = alert.get("plate_text")
            reason = alert.get("reason")
            cam_id = alert.get("camera_id")
            time_iso = alert.get("timestamp_iso")
            pts = alert.get("timestamp_pts")
            snap = alert.get("snapshot_path")
            
            # Resolve camera name
            cam_name = cam_id
            for c_info in LOCAL_CAMERAS:
                if c_info["id"] == cam_id:
                    cam_name = c_info["name"]
                    break
                    
            with st.container():
                st.markdown(f"""
                <div class="alert-card">
                    <div class="alert-title">🚨 WATCHLIST HIT: {plate}</div>
                    <div class="alert-meta">
                        <b>Reason:</b> {reason}<br>
                        <b>Camera:</b> {cam_name} ({cam_id})<br>
                        <b>Timestamp:</b> {time_iso} (PTS: {pts:.1f}ms)
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                c_img, c_btn = st.columns([1, 2])
                with c_img:
                    if snap and (BASE_DIR / snap).exists():
                        st.image(str(BASE_DIR / snap), width=90)
                with c_btn:
                    if st.button(f"Track {plate}", key=f"track_alt_{alert['id']}"):
                        st.session_state["active_query"] = plate
                        st.session_state["query_type"] = "plate"

# ----------------------------------------------------
# 4. CROSS-CAMERA TRACKING & GIS MAP
# ----------------------------------------------------
st.markdown('<div class="section-title">3. Cross-Camera Target Correlation & Route Tracking</div>', unsafe_allow_html=True)

if "active_query" not in st.session_state:
    st.session_state["active_query"] = "GJ01AB1234"
if "query_type" not in st.session_state:
    st.session_state["query_type"] = "plate"

ctrl_col1, ctrl_col2, ctrl_col3, ctrl_col4 = st.columns([2, 1, 1, 1])
with ctrl_col1:
    search_mode = st.radio(
        "Search Method:",
        ["License Plate Search (High Confidence)", "Person / Object Visual Attributes (Lower Confidence)"],
        horizontal=True,
        index=0 if st.session_state["query_type"] == "plate" else 1,
    )

if "License Plate" in search_mode:
    st.session_state["query_type"] = "plate"
    with ctrl_col2:
        plate_search = st.text_input("Enter Plate:", value=st.session_state.get("active_query", "GJ01AB1234"))
    with ctrl_col3:
        st.write("&nbsp;")
        if st.button("Suspect 1 (GJ01AB1234)", use_container_width=True):
            plate_search = "GJ01AB1234"
            st.session_state["active_query"] = "GJ01AB1234"
    with ctrl_col4:
        st.write("&nbsp;")
        if st.button("Suspect 2 (GJ05CD5678)", use_container_width=True):
            plate_search = "GJ05CD5678"
            st.session_state["active_query"] = "GJ05CD5678"
            
    correlation_data = correlate_by_plate(plate_search)
else:
    st.session_state["query_type"] = "visual"
    with ctrl_col2:
        v_class = st.selectbox("Class:", ["person", "car", "bus", "truck", "motorcycle", "bicycle"], index=0)
    with ctrl_col3:
        v_color = st.selectbox("Color:", ["Red", "White", "Blue", "Black", "Silver/Gray", "Yellow"], index=0)
    with ctrl_col4:
        st.write("&nbsp;")
        st.caption("Visual Matching Window: 10 mins")
        
    correlation_data = correlate_by_visual(v_class, v_color)

# Display Tracking Breadcrumb & Correlation Details
hops = correlation_data.get("journey", [])
conf_type = correlation_data.get("confidence_type", "None")
conf_score = correlation_data.get("confidence_score", 0.0)

if not hops:
    st.warning(correlation_data.get("message", "No cross-camera detections found for this query."))
else:
    # Build Breadcrumb: CAM 01 -> CAM 02 -> CAM 03
    breadcrumb_parts = []
    for h in hops:
        breadcrumb_parts.append(f"<span style='color: #ffffff; background: #21262d; padding: 2px 8px; border-radius: 4px;'>{h['camera_id']} ({h['camera_name']})</span>")
    breadcrumb_html = " <span class='hop-arrow'>➔</span> ".join(breadcrumb_parts)
    
    badge_class = "badge-high" if conf_score >= 0.8 else "badge-low"
    
    st.markdown(f"""
    <div class="hop-breadcrumb">
        <span>Correlated Corridor:</span> {breadcrumb_html}
        <span style="margin-left: auto;" class="{badge_class}">{conf_type} — {int(conf_score * 100)}%</span>
    </div>
    """, unsafe_allow_html=True)
    
    if conf_score < 0.8:
        st.info("ℹ️ **LOWER CONFIDENCE NOTICE:** Visual correlation matches detected bounding box attributes (class + dominant color). This system does not perform facial recognition or biometric identity tracking.")

    # Split View: GIS Route Map on Left, Sequenced Hop Details on Right
    map_col, list_col = st.columns([1.1, 0.9])
    
    with map_col:
        st.markdown("**Geographic Correlation Route**")
        m = folium.Map(
            location=[23.0298, 72.5250],
            zoom_start=13,
            tiles="CartoDB dark_matter",
        )
        
        # Plot all fixed camera checkpoints
        for cam in LOCAL_CAMERAS:
            folium.CircleMarker(
                location=[cam["latitude"], cam["longitude"]],
                radius=6,
                color="#8b949e",
                fill=True,
                fill_color="#21262d",
                fill_opacity=0.8,
                tooltip=f"CCTV: {cam['name']}",
            ).add_to(m)
            
        # Draw route polyline
        coords = correlation_data.get("coordinates", [])
        if len(coords) > 1:
            folium.PolyLine(
                locations=coords,
                color="#58a6ff",
                weight=4,
                opacity=0.9,
                dash_array="6",
                tooltip="Transit Corridor",
            ).add_to(m)
            
        # Numbered markers for each hop
        for h in hops:
            h_num = h["hop_number"]
            h_lat = h["latitude"]
            h_lon = h["longitude"]
            h_cam = h["camera_name"]
            h_time = h["timestamp_iso"]
            h_spd = h["estimated_speed_kmh"]
            
            popup_html = f"<b>Hop #{h_num}: {h_cam}</b><br>Time: {h_time}<br>Speed: {h_spd} km/h"
            
            folium.Marker(
                location=[h_lat, h_lon],
                popup=folium.Popup(popup_html, max_width=200),
                tooltip=f"Hop #{h_num}: {h_cam}",
                icon=folium.DivIcon(
                    html=f"""
                    <div style="
                        background-color: #f85149;
                        color: white;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        font-size: 12px;
                        border: 2px solid white;
                    ">{h_num}</div>
                    """
                )
            ).add_to(m)
            
        st_folium(m, width=None, height=360, returned_objects=[])

    with list_col:
        st.markdown("**Hop-by-Hop Telemetry**")
        for h in hops:
            h_num = h["hop_number"]
            h_cam = h["camera_name"]
            h_id = h["camera_id"]
            h_time = h["timestamp_iso"]
            h_delta = h["time_delta_from_prev_sec"]
            h_dist = h["distance_from_prev_m"]
            h_spd = h["estimated_speed_kmh"]
            h_snap = h["snapshot_path"]
            h_plate = h["plate_text"] or "N/A"
            h_color = h["color"]
            h_class = h["object_class"]
            
            transit_desc = "Initial Entry Checkpoint" if h_num == 1 else f"Transit: +{h_delta:.1f}s | {h_dist:.0f}m | Est. Speed: ~{h_spd:.1f} km/h"
            
            col_s1, col_s2 = st.columns([1, 2.5])
            with col_s1:
                if h_snap and (BASE_DIR / h_snap).exists():
                    st.image(str(BASE_DIR / h_snap), width=100)
                else:
                    st.caption("[No snapshot]")
            with col_s2:
                st.markdown(f"**Hop #{h_num}: {h_id} — {h_cam}**")
                st.caption(f"🕒 **Time:** {h_time} | **Target:** {h_color} {h_class} ({h_plate})")
                st.markdown(f"<span style='color: #58a6ff; font-size: 12px; font-weight: 600;'>{transit_desc}</span>", unsafe_allow_html=True)
            st.divider()

# ----------------------------------------------------
# 5. DETECTION SUMMARY (All 8 COCO target classes from SQLite)
# ----------------------------------------------------
st.markdown('<div class="section-title">4. Object Intelligence Breakdown (SQLite Database)</div>', unsafe_allow_html=True)

class_cols = st.columns(8)
for i, cls_name in enumerate(target_classes):
    count = detected_class_counts.get(cls_name, 0)
    with class_cols[i]:
        st.markdown(f"""
        <div class="nexus-card" style="text-align: center; padding: 10px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #8b949e; font-weight: 700;">{cls_name}</div>
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 4px;">{count}</div>
        </div>
        """, unsafe_allow_html=True)

# ----------------------------------------------------
# 6. LIVE DETECTION FEED & EXPORT DELIVERABLE
# ----------------------------------------------------
st.markdown('<div class="section-title">5. Recent Detections Log & CSV Deliverable</div>', unsafe_allow_html=True)

col_ctrl1, col_ctrl2, col_ctrl3 = st.columns([2, 2, 1])
with col_ctrl1:
    filter_cam = st.selectbox("Filter Camera:", ["All Cameras"] + [c["name"] for c in LOCAL_CAMERAS])
with col_ctrl2:
    filter_cls = st.selectbox("Filter Object Class:", ["All Classes"] + target_classes)
with col_ctrl3:
    st.write("&nbsp;")
    if st.button("Export CSV", use_container_width=True):
        csv_file = BASE_DIR / "detections_export.csv"
        export_detections_csv(str(csv_file))
        st.success("Exported!")
        with open(csv_file, "rb") as f:
            st.download_button("Download CSV", f, file_name="detections_export.csv", mime="text/csv", use_container_width=True)

cam_param = None
if filter_cam != "All Cameras":
    for c_info in LOCAL_CAMERAS:
        if c_info["name"] == filter_cam:
            cam_param = c_info["id"]
            break
cls_param = None if filter_cls == "All Classes" else filter_cls

recent_dets = get_all_detections(camera_id=cam_param, object_class=cls_param, limit=8)

det_grid = st.columns(4)
for idx, d in enumerate(recent_dets[:8]):
    col = det_grid[idx % 4]
    with col:
        s_path = d.get("snapshot_path")
        if s_path and (BASE_DIR / s_path).exists():
            st.image(str(BASE_DIR / s_path), use_container_width=True)
        st.markdown(f"**{d['object_class'].upper()}** — `{d['color']}`")
        if d.get("plate_text"):
            st.markdown(f"Plate: `{d['plate_text']}`")
        st.caption(f"{d['camera_name']} | {d['timestamp_iso']}")
        st.caption(f"Conf: {d['confidence']:.2f}")
