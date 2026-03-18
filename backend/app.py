import streamlit as st
import requests
import os

st.title("🌾 CropSight AI")

uploaded = st.file_uploader("Upload Farm Image")

if uploaded:
    st.image(uploaded)

    files = {"file": uploaded}
    res = requests.post("http://127.0.0.1:8000/upload", files=files)

    file_path = res.json()["file_path"]

    analyze_res = requests.post(
        "http://127.0.0.1:8000/analyze",
        json={"file_path": file_path}
    )

    data = analyze_res.json()

    st.subheader("Results")

    st.write("Overall Health:", data.get("overall_health", "N/A"), "%")
    st.write("Status:", data.get("status", "N/A"))
    st.write("Recommendation:", data.get("recommendation", "N/A"))
    st.write("Severity:", data["severity"], "%")
    st.write("Action:", data["action"])
    st.write("Spray Required %:", data["spray_required_percent"])

    col1, col2 = st.columns(2)
    with col1:
        st.write("Health Map")
        st.image("storage/outputs/map.png")
    with col2:
        if "mask_url" in data:
            st.write("Stress Mask (White = Stressed)")
            # The mask is in storage/uploads, we can read it directly for streamlit
            mask_filename = os.path.basename(data["mask_url"])
            st.image(f"storage/uploads/{mask_filename}")

    st.write("Spray Zones:", data["spray_zones"])