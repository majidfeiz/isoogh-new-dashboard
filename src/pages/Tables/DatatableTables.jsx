// src/components/filter.
import React, { useMemo } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../components/Common/Breadcrumb';
import TableContainer from '../../components/Common/TableContainer';

const DatatableTables = () => {

    const columns = useMemo(
      () => [
        {
          header: "نام",
          accessorKey: "name",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "موقع",
          accessorKey: "position",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "دفتر",
          accessorKey: "office",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "سن",
          accessorKey: "age",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "تاریخ شروع",
          accessorKey: "startDate",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "حقوق",
          accessorKey: "salary",
          enableColumnFilter: false,
          enableSorting: true,
        },
      ],
      []
    );

    const data = [
      {
        name: "سارا نوری",
        position: "مدیر منطقه",
        age: 28,
        office: "تهران",
        startDate: "1400/11/14",
        salary: "تومان 357,650",
      },
      {
        name: "علی زمانی",
        position: "توسعه دهنده",
        age: 42,
        office: "مشهد",
        startDate: "1400/12/22",
        salary: "تومان 92,575",
      },
      {
        name: "ابراهیم همتی",
        position: "مدیر عامل (مدیرعامل)",
        age: 47,
        office: "قم",
        startDate: "1400/10/09",
        salary: "تومان 1,200,000",
      },
      {
        name: "نازنین رستگار",
        position: "دستیار فروش",
        age: 23,
        office: "قزوین",
        startDate: "1400/09/20",
        salary: "تومان 85,600",
      },
      {
        name: "داراب سهیلی",
        position: "پشتیبانی قبل از فروش",
        age: 21,
        office: "ایلام",
        startDate: "1400/12/12",
        salary: "تومان 106,450",
      },
      {
        name: "صادق دهپرور",
        position: "مدیر ارشد بازاریابی (CMO)",
        age: 40,
        office: "ایلام",
        startDate: "1400/06/25",
        salary: "تومان 675,000",
      },
      {
        name: "سامیار داوری",
        position: "رهبر توسعه",
        age: 30,
        office: "تهران",
        startDate: "1401/09/03",
        salary: "تهران 345,000",
      },
      {
        name: "سیما اقایی",
        position: "رهبر توسعه",
        age: 35,
        office: "تهران",
        startDate: "1401/09/26",
        salary: "تهران 217,500",
      },
      {
        name: "هلیا قربانی",
        position: "مهندس نرم افزار",
        age: 41,
        office: "تهران",
        startDate: "1401/10/13",
        salary: "تهران 132,000",
      },
      {
        name: "لادن ابراهیمی",
        position: "مدیر سیستم ها",
        age: 59,
        office: "مشهد",
        startDate: "1401/04/10",
        salary: "تهران 237,500",
      },
      {
        name: "ریحانه قاسمی",
        position: "مدیر ارشد مالی (CFO)",
        age: 64,
        office: "مشهد",
        startDate: "1401/06/09",
        salary: "تهران 725,000",
      },
      {
        name: "دلینا نوری",
        position: "طراح بازاریابی",
        age: 66,
        office: "مشهد",
        startDate: "1401/11/27",
        salary: "تهران 198,500",
      },
      {
        name: "اتنا فرخی",
        position: "مدیر منطقه",
        age: 19,
        office: "مشهد",
        startDate: "1401/03/17",
        salary: "تومان 385,750",
      },
      {
        name: "امیر محمد فتحی",
        position: "طراح بازاریابی",
        age: 43,
        office: "شیراز",
        startDate: "1401/12/18",
        salary: "تومان 313,500",
      },
      {
        name: "عماد تقی زاده",
        position: "مدیر منطقه",
        age: 36,
        office: "شیراز",
        startDate: "1401/10/16",
        salary: "تومان 470,600",
      },
      {
        name: "ارین ایرانی",
        position: "مدیر پشتیبانی",
        age: 22,
        office: "شیراز",
        startDate: "1401/03/03",
        salary: "تومان 342,000",
      },
      {
        name: "سامان تهرانی",
        position: "مدیر دفتر",
        age: 30,
        office: "اصفهان",
        startDate: "1401/12/19",
        salary: "تومان 90,560",
      },
      {
        name: "لاله موسوی",
        position: "مهندس نرم افزار",
        age: 23,
        office: "اصفهان",
        startDate: "1401/12/13",
        salary: "تومان 103,600",
      },
      {
        name: "تینا علامه",
        position: "Javascript توسعه دهنده",
        age: 39,
        office: "اصفهان",
        startDate: "1401/09/15",
        salary: "تومان 205,500",
      },
      {
        name: "داراب داوودی",
        position: "کارشناس ادغام",
        age: 55,
        office: "اصفهان",
        startDate: "1401/10/14",
        salary: "تومان 327,900",
      },
      {
        name: "سهیل راد",
        position: "دستیار فروش",
        age: 59,
        office: "تهران",
        startDate: "1401/08/06",
        salary: "تومان 137,500",
      },
      {
        name: "زینب مبارز",
        position: "کارشناس ادغام",
        age: 62,
        office: "تهران",
        startDate: "1402/12/02",
        salary: "تومان 372,000",
      },
      {
        name: "اناهید اریانا",
        position: "حسابدار",
        age: 33,
        office: "تهران",
        startDate: "1402/11/28",
        salary: "تومان 162,700",
      },
      {
        name: "ریحانه دباغ",
        position: "Javascript توسعه دهنده",
        age: 22,
        office: "تهران",
        startDate: "1402/03/29",
        salary: "تومان 433,060",
      },
      {
        name: "فاطمه تهرانی",
        position: "نویسنده فنی جوان",
        age: 66,
        office: "قم",
        startDate: "1402/01/12",
        salary: "تومان 86,000",
      },
      {
        name: "ماهان احمدی",
        position: "حسابدار",
        age: 63,
        office: "قم",
        startDate: "1402/07/25",
        salary: "تومان 170,750",
      },
      {
        name: "دلوین عباسی",
        position: "معمار سیستم",
        age: 61,
        office: "قم",
        startDate: "1402/04/25",
        salary: "تومان 320,800",
      },
    ];

    //meta title
    document.title = "Data Tables | Skote - قالب مدیریتی و داشبورد Vite React ";

    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="جدول ها" breadcrumbItem="جدول اطلاعات" />
                <TableContainer
                    columns={columns}
                    data={data || []}
                    isGlobalFilter={true}
                    isPagination={true}
                    SearchPlaceholder="27 ردیف..."
                    pagination="pagination"
                    paginationWrapper='dataTables_paginate paging_simple_numbers'
                    tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />
            </div>
        </div>
    );
}
DatatableTables.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default DatatableTables;