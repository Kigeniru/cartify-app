import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

import { db, auth } from '../../firebase';
import { doc, collection, onSnapshot, query, orderBy, getDoc } from 'firebase/firestore';

import logo from '../../assets/mvillo-logo.png';

// Import libraries for PDF and Excel export
import html2pdf from 'html2pdf.js';
// Remove XLSX, use ExcelJS
// import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs'; // Keep ExcelJS import

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: '0',
    totalOrdersAllTime: '0',
    ordersLast30Days: '0',
    pendingDeliveries: '0',
    totalProductsSold: '0',
    totalRevenue: '₱0.00'
  });
  const [salesPerformanceData, setSalesPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dashboardRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [contactInfo, setContactInfo] = useState({
    phone: 'N/A',
    email: 'N/A'
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser && currentUser.uid) {
        const userDocRef = doc(db, 'Users', currentUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setCurrentUser(prev => ({
              ...prev,
              firstName: userData.firstName || 'User',
              lastName: userData.lastName || ''
            }));
          } else {
            console.log("User profile not found for UID:", currentUser.uid);
            setCurrentUser(prev => ({
              ...prev,
              firstName: 'User',
              lastName: ''
            }));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setCurrentUser(prev => ({
            ...prev,
            firstName: 'Error',
            lastName: 'User'
          }));
        }
      } else if (currentUser === null) {
        setCurrentUser(null);
      }
    };

    if (currentUser !== undefined) {
      fetchUserProfile();
    }
  }, [currentUser]);


  useEffect(() => {
    const unsubscribes = [];

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    unsubscribes.push(unsubscribeAuth);

    const statsRef = doc(db, 'dashboardStats', 'summary');
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDashboardStats({
          totalUsers: data.totalUsers?.toLocaleString() || '0',
          totalOrdersAllTime: data.totalOrdersAllTime?.toLocaleString() || '0',
          ordersLast30Days: data.ordersLast30Days?.toLocaleString() || '0',
          pendingDeliveries: data.pendingDeliveries?.toLocaleString() || '0',
          totalProductsSold: data.totalProductsSold?.toLocaleString() || '0',
          totalRevenue: `₱${data.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`
        });
        setLoading(false);
      } else {
        console.log("No dashboard stats summary document found. Initializing with zeros.");
        setDashboardStats({
          totalUsers: '0',
          totalOrdersAllTime: '0',
          ordersLast30Days: '0',
          pendingDeliveries: '0',
          totalProductsSold: '0',
          totalRevenue: '₱0.00'
        });
        setLoading(false);
      }
    }, (err) => {
      console.error("Error listening to dashboard stats: ", err);
      setError("Failed to load dashboard statistics.");
      setLoading(false);
    });
    unsubscribes.push(unsubscribeStats);

    const salesCollectionRef = collection(db, 'monthlySales');
    const q = query(salesCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribeSales = onSnapshot(q, (snapshot) => {
      const fetchedSales = snapshot.docs.map(doc => doc.data());
      const formattedSales = fetchedSales.map(item => ({
        name: item.monthName,
        sales: item.salesAmount
      }));
      setSalesPerformanceData(formattedSales);
    }, (err) => {
      console.error("Error listening to sales data: ", err);
      setError("Failed to load sales performance data.");
    });
    unsubscribes.push(unsubscribeSales);

    const contactRef = doc(db, 'staticPages', 'contact');
    const unsubscribeContact = onSnapshot(contactRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setContactInfo({
          phone: data.contactNumber || 'N/A',
          email: data.email || 'N/A',
        });
      } else {
        console.log("No staticPages/contact document found.");
        setContactInfo({ phone: 'N/A', email: 'N/A' });
      }
    }, (err) => {
      console.error("Error listening to contact info:", err);
    });

    unsubscribes.push(unsubscribeContact);

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(prevState => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownContainer = document.querySelector('.print-dropdown-container');
      if (dropdownContainer && !dropdownContainer.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getReportMetaData = () => {
    const downloadedAt = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const preparedBy = currentUser
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'N/A'
      : 'N/A';
    const companyName = "Mvillo Sales Dashboard";
    const companySlogan = "Your Success, Our Insight";

    return { downloadedAt, preparedBy, companyName, companySlogan, contactInfo };
  };


  const exportToPdf = () => {
    setIsDropdownOpen(false);

    if (dashboardRef.current) {
      const { downloadedAt, preparedBy, companyName, companySlogan, contactInfo } = getReportMetaData();

      const printContent = document.createElement('div');
      printContent.style.width = '816px';
      printContent.style.boxSizing = 'border-box';

      const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
          <div style="display: flex; align-items: center;">
            <img src="${logo}" alt="Company Logo" style="height: 60px; margin-right: 15px;" />
            <div>
              <h1 style="font-family: 'Inter', sans-serif; font-size: 24px; font-weight: bold; color: #333; margin: 0;">${companyName.toUpperCase()}</h1>
              <p style="font-family: 'Inter', sans-serif; font-size: 14px; color: #777; margin: 0;">${companySlogan}</p>
            </div>
          </div>
          <div style="text-align: right; font-family: 'Inter', sans-serif; font-size: 14px; color: #555;">
            <p style="margin: 0 0 5px 0;">📞 ${contactInfo.phone}</p>
            <p style="margin: 0;">✉️ ${contactInfo.email}</p>
          </div>
        </div>
      `;

      const clonedDashboard = dashboardRef.current.cloneNode(true);
      const headerWrapper = document.createElement('div');
      headerWrapper.innerHTML = headerHtml;
      const headerElement = headerWrapper.firstElementChild;

      clonedDashboard.insertBefore(headerElement, clonedDashboard.firstChild);

      const printButtonContainer = clonedDashboard.querySelector('.print-dropdown-container');
      if (printButtonContainer) {
        printButtonContainer.remove();
      }

      const salesChartContainer = clonedDashboard.querySelector('.sales-chart-container');
      if (salesChartContainer) {
        salesChartContainer.style.width = '700px';
        salesChartContainer.style.height = '350px';
      }

      clonedDashboard.style.transform = 'scale(0.75)';
      clonedDashboard.style.transformOrigin = 'top left';
      clonedDashboard.style.width = `${(816 - (0.7 * 2 * 96)) / 0.85}px`;
      clonedDashboard.style.maxWidth = '100%';

      const footerHtml = `
        <div style="
          border-top: 1px solid #eee;
          padding-top: 10px;
          font-size: 12px;
          color: #000;
          font-family: 'Inter', sans-serif;
          display: flex;
          justify-content: space-between;
        ">
          <div>
            Downloaded: ${downloadedAt} | Prepared by: ${preparedBy}
          </div>
          <div>
            Page 1 of 1
          </div>
        </div>
      `;

      const footerElement = document.createElement('div');
      footerElement.innerHTML = footerHtml;
      clonedDashboard.appendChild(footerElement);
      printContent.appendChild(clonedDashboard);

      const reportDate = new Date().toISOString().slice(0, 10);
      const filename = `Mvillo_Sales Report_${reportDate}.pdf`;

      const opt = {
        margin: [0.7, 0.7, 0.7, 0.7],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };

      html2pdf().set(opt).from(printContent).save().then(() => {
        // document.body.removeChild(printContent); // Consider removing only if explicitly added to body for conversion
      });

    } else {
      console.error("Dashboard content ref is null. Cannot export to PDF.");
      alert("Error: Could not find dashboard content to print.");
    }
  };


  // --- EXCEL EXPORT FUNCTION USING EXCELJS (REVISED) ---
  const exportToExcel = async () => {
    setIsDropdownOpen(false);

    const { downloadedAt, preparedBy, companyName, companySlogan, contactInfo } = getReportMetaData();
    const currentTimestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const workbook = new ExcelJS.Workbook();
    workbook.creator = preparedBy;
    workbook.lastModifiedBy = preparedBy;
    workbook.created = new Date();
    workbook.modified = new Date();

    // --- Dashboard Summary Sheet ---
    const summarySheet = workbook.addWorksheet('Dashboard Summary');

    // Header Row 1 (Merged Cell)
    summarySheet.mergeCells('A1:B1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = `${companyName} - Summary Report`;
    titleCell.font = { name: 'Arial', size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Header Row 2
    summarySheet.mergeCells('A2:B2');
    const sloganCell = summarySheet.getCell('A2');
    sloganCell.value = companySlogan;
    sloganCell.font = { name: 'Arial', size: 12, italic: true, color: { argb: 'FF808080' } }; // Gray color
    sloganCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add empty row for spacing
    summarySheet.addRow([]);

    // Contact Info Section
    summarySheet.addRow(['Contact Information:']).eachCell(cell => { cell.font = { bold: true }; });
    summarySheet.addRow([`Phone: ${contactInfo.phone}`]);
    summarySheet.addRow([`Email: ${contactInfo.email}`]);

    // Add empty row for spacing
    summarySheet.addRow([]);

    // Report Metadata Section
    summarySheet.addRow(['Report Downloaded:', downloadedAt]).eachCell((cell, colNumber) => {
        if (colNumber === 1) cell.font = { bold: true };
    });
    summarySheet.addRow(['Prepared By:', preparedBy]).eachCell((cell, colNumber) => {
        if (colNumber === 1) cell.font = { bold: true };
    });

    // Add empty row for spacing
    summarySheet.addRow([]);

    // Table Headers for Dashboard Stats
    const statsHeaders = ['Metric', 'Value'];
    const headerRow = summarySheet.addRow(statsHeaders);
    headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007BFF' } }; // Blue background
        cell.alignment = { horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
        };
    });

    // Dashboard Stats Data - Ensure values are converted to numbers for proper Excel handling
    summarySheet.addRow(["Total Users", parseInt(dashboardStats.totalUsers.replace(/,/g, '') || '0')]).eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    summarySheet.addRow(["Total Orders (All Time)", parseInt(dashboardStats.totalOrdersAllTime.replace(/,/g, '') || '0')]).eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    summarySheet.addRow(["Orders (Last 30 Days)", parseInt(dashboardStats.ordersLast30Days.replace(/,/g, '') || '0')]).eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    summarySheet.addRow(["Pending Deliveries", parseInt(dashboardStats.pendingDeliveries.replace(/,/g, '') || '0')]).eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    summarySheet.addRow(["Products Sold (All Time)", parseInt(dashboardStats.totalProductsSold.replace(/,/g, '') || '0')]).eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    const revenueRow = summarySheet.addRow(["Total Revenue (All Time)", parseFloat(dashboardStats.totalRevenue.replace('₱', '').replace(/,/g, '') || '0')]);
    revenueRow.getCell(2).numFmt = '₱#,##0.00'; // Apply currency format
    revenueRow.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });


    // Set Column Widths for Summary Sheet
    summarySheet.columns = [
        { key: 'metric', width: 30 },
        { key: 'value', width: 20 }
    ];

    // --- Monthly Sales Sheet ---
    const salesSheet = workbook.addWorksheet('Monthly Sales');

    // Table Headers for Monthly Sales
    const salesHeaders = ['Month', 'Sales Amount'];
    const salesHeaderRow = salesSheet.addRow(salesHeaders);
    salesHeaderRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF28A745' } }; // Green background
        cell.alignment = { horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
        };
    });

    // Monthly Sales Data
    // Determine the start row for sales data (after headers)
    const salesDataStartRow = salesSheet.actualRowCount + 1;
    salesPerformanceData.forEach(item => {
        const row = salesSheet.addRow([item.name, item.sales]);
        row.getCell(2).numFmt = '₱#,##0.00'; // Apply currency format to sales column
        row.eachCell(cell => {
             cell.border = {
                top: { style: 'thin' }, left: { style: 'thin' },
                bottom: { style: 'thin' }, right: { style: 'thin' }
            };
        });
    });

    // Set Column Widths for Sales Sheet
    salesSheet.columns = [
        { key: 'month', width: 15 },
        { key: 'salesAmount', width: 20 }
    ];

    // --- Line Chart for Monthly Sales ---
    // Add some space after the table for the chart (adjust as needed)
    salesSheet.addRow([]);
    salesSheet.addRow([]);

    const chartRowStart = salesSheet.actualRowCount + 1; // Position the chart below data and blank rows

    // Ensure salesPerformanceData has at least 2 data points for a line chart
    if (salesPerformanceData.length >= 2) {
        try {
            salesSheet.addChart({
                type: 'line',
                model: {
                    plotArea: { wireframe: false },
                    valAxis: [
                        {
                            title: { text: 'Sales (PHP)' },
                            minorGridlines: { visible: false },
                            majorGridlines: { visible: true },
                            min: 0 // Start Y-axis at 0
                        }
                    ],
                    catAxis: [
                        {
                            title: { text: 'Month' },
                            majorTickMark: 'none'
                        }
                    ],
                    series: [
                        {
                            name: 'Sales',
                            categories: {
                                sheet: 'Monthly Sales',
                                // Range for Month names, starting from the second row (A2) to the last data row
                                // Make sure this range is correct based on where your data actually lands.
                                formula: `\'Monthly Sales\'!$A$${salesDataStartRow}:$A$${salesDataStartRow + salesPerformanceData.length - 1}`
                            },
                            values: {
                                sheet: 'Monthly Sales',
                                // Range for Sales Amounts, starting from the second row (B2) to the last data row
                                formula: `\'Monthly Sales\'!$B$${salesDataStartRow}:$B$${salesDataStartRow + salesPerformanceData.length - 1}`
                            },
                            line: {
                                color: { argb: 'FF3B82F6' }, // Blue color for line
                                width: 25000 // Line thickness (25000 EMU = 2.5pt)
                            }
                        }
                    ],
                    title: { text: 'Monthly Sales Performance' },
                    legend: { position: 'bottom' }
                },
                // Position and size of the chart on the sheet (in columns and rows)
                // tl: top-left corner, br: bottom-right corner
                tl: { col: 0.5, row: chartRowStart }, // Start at col 0.5 (halfway into A), row 'chartRowStart'
                br: { col: 8.5, row: chartRowStart + 15 } // Extend to col 8.5 (halfway into I), 15 rows down
            });
        } catch (chartError) {
            console.error("Error adding chart with ExcelJS:", chartError);
            alert("Failed to add chart to Excel. A simplified Excel report will be generated.");
        }
    } else {
        console.warn("Not enough data to generate a line chart (need at least 2 data points).");
    }

    // Generate and save the workbook
    try {
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Mvillo_Sales Report_${currentTimestamp}.xlsx`);
    } catch (saveError) {
        console.error("Error writing or saving Excel file:", saveError);
        alert("An error occurred while saving the Excel file.");
    }
  };


  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }
  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container" ref={dashboardRef}>
      <div className="dashboard-header">
        <p className='dashboard-title'>Dashboard</p>
        <div className="print-dropdown-container">
          <button onClick={toggleDropdown} className="print-button">
            Print/Export &#9662;
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={exportToPdf} className="dropdown-item">Print to PDF</button>
              <button onClick={exportToExcel} className="dropdown-item">Export to Excel</button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-cards-grid">
        <DashboardCard title="Total Users" value={dashboardStats.totalUsers} description="All Time" />
        <DashboardCard title="Total Orders" value={dashboardStats.totalOrdersAllTime} description="All Time" />
        <DashboardCard title="Orders (30 Days)" value={dashboardStats.ordersLast30Days} description="Last 30 days" />
        <DashboardCard title="Pending Deliveries" value={dashboardStats.pendingDeliveries} description="Current" />
        <DashboardCard title="Products Sold" value={dashboardStats.totalProductsSold} description="All Time" />
        <DashboardCard title="Revenue" value={dashboardStats.totalRevenue} description="All Time" />
      </div>

      <section className="dashboard-section">
        <h3 className="dashboard-section-title">Sales Performance</h3>
        <div className="sales-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesPerformanceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#ccc' }} />
              <YAxis tickLine={false} axisLine={{ stroke: '#ccc' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

const DashboardCard = ({ title, value, description }) => (
  <div className="dashboard-card">
    <h3 className="dashboard-card-title">{title}</h3>
    <p className="dashboard-card-value">{value}</p>
    <p className="dashboard-card-description">{description}</p>
  </div>
);

export default Dashboard;