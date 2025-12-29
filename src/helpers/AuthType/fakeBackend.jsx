import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import * as url from "../url_helper";
import accessToken from "../jwt-token-access/accessToken";
import {
  calenderDefaultCategories,
  cartData,
  chats,
  comments,
  contacts,
  customerData,
  events,
  groups,
  invoiceList,
  messages,
  orders,
  productsData,
  projects,
  recentProducts,
  shops,
  tasks,
  userProfile,
  users as members,
  wallet,
  dahsboardEmail,
  TopSellingData,
  dashboardEarning,
  productComments,
  jobs,
  jobApply,
  walletOptions,
  visitor,
  statisticsApplications,
  productData,
  cryptoOrderData,
  mailDB
} from "../../common/data";

let users = [
  {
    uid: 1,
    username: "admin",
    role: "admin",
    password: "123456",
    email: "admin@themesbrand.com",
  },
];

const fakeBackend = () => {
  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axios, { onNoMatch: "passthrough" });

  mock.onPost(url.POST_FAKE_REGISTER).reply((config) => {
    const user = JSON.parse(config["data"]);
    users.push(user);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([200, user]);
      });
    });
  });

  mock.onPost("/post-fake-login").reply((config) => {
    const user = JSON.parse(config["data"]);
    const validUser = users.filter(
      (usr) => usr.email === user.email && usr.password === user.password
    );

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (validUser["length"] === 1) {
          resolve([200, validUser[0]]);
        } else {
          reject([
            "نام کاربری و رمز عبور نامعتبر است. لطفا نام کاربری و رمز عبور صحیح را وارد کنید",
          ]);
        }
      });
    });
  });

  mock.onPost("/fake-forget-pwd").reply((config) => {
    // User needs to check that user is eXist or not and send mail for Reset New password

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          200,
          "ایمیل خود را بررسی کنید و رمز عبور خود را بازنشانی کنید",
        ]);
      });
    });
  });

  mock.onPost("/post-jwt-register").reply((config) => {
    const user = JSON.parse(config["data"]);
    users.push(user);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([200, user]);
      });
    });
  });

  mock.onPost("/post-jwt-login").reply((config) => {
    const user = JSON.parse(config["data"]);
    const validUser = users.filter(
      (usr) => usr.email === user.email && usr.password === user.password
    );

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (validUser["length"] === 1) {
          // You have to generate AccessToken by jwt. but this is fakeBackend so, right now its dummy
          const token = accessToken;
          const userName = user.name;

          // JWT AccessToken
          const tokenObj = { accessToken: token, username: userName }; // Token Obj
          const validUserObj = { ...validUser[0], ...tokenObj, ...user.name }; // validUser Obj

          resolve([200, validUserObj]);
        } else {
          reject([
            400,
            "نام کاربری و رمز عبور نامعتبر است. لطفا نام کاربری و رمز عبور صحیح را وارد کنید",
          ]);
        }
      });
    });
  });

  mock.onPost("/post-jwt-profile").reply((config) => {
    const user = JSON.parse(config["data"]);

    const one = config.headers;

    let finalToken = one.Authorization;

    const validUser = users.filter((usr) => usr.uid === user.idx);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Verify Jwt token from header.Authorization
        if (finalToken === accessToken) {
          if (validUser["length"] === 1) {
            let objIndex;

            //Find index of specific object using findIndex method.
            objIndex = users.findIndex((obj) => obj.uid === user.idx);

            //Update object's name property.
            users[objIndex].username = user.username;

            // Assign a value to locastorage
            localStorage.removeItem("authUser");
            localStorage.setItem("authUser", JSON.stringify(users[objIndex]));

            resolve([200, "نمایه با موفقیت به روز شد"]);
          } else {
            reject([400, "مشکلی برای ویرایش نمایه وجود دارد"]);
          }
        } else {
          reject([400, "توکن نامعتبر است !!"]);
        }
      });
    });
  });

  mock.onPost("/post-fake-profile").reply((config) => {
    const user = JSON.parse(config["data"]);

    const validUser = users.filter((usr) => usr.uid === user.idx);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (validUser["length"] === 1) {
          let objIndex;

          //Find index of specific object using findIndex method.
          objIndex = users.findIndex((obj) => obj.uid === user.idx);

          //Update object's name property.
          users[objIndex].username = user.username;

          // Assign a value to locastorage
          localStorage.removeItem("authUser");
          localStorage.setItem("authUser", JSON.stringify(users[objIndex]));

          resolve([200, "نمایه با موفقیت به روز شد"]);
        } else {
          reject([
            400,
            "نمایه با موفقیت به روز شد مشکلی برای ویرایش نمایه وجود دارد",
          ]);
        }
      });
    });
  });

  mock.onPost("/jwt-forget-pwd").reply((config) => {
    // User needs to check that user is eXist or not and send mail for Reset New password

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          200,
          "ایمیل خود را بررسی کنید و رمز عبور خود را بازنشانی کنید",
        ]);
      });
    });
  });

  mock.onPost("/social-login").reply((config) => {
    const user = JSON.parse(config["data"]);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (user && user.token) {
          // You have to generate AccessToken by jwt. but this is fakeBackend so, right now its dummy
          const token = accessToken;
          const userName = user.name;

          // JWT AccessToken
          const tokenObj = { accessToken: token, username: userName }; // Token Obj
          const validUserObj = { ...user[0], ...tokenObj, ...user.name }; // validUser Obj

          resolve([200, validUserObj]);
        } else {
          reject([
            400,
            "نام کاربری و رمز عبور نامعتبر است. لطفا نام کاربری و رمز عبور صحیح را وارد کنید",
          ]);
        }
      });
    });
  });

  mock.onGet(url.GET_PRODUCTS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (productsData) {
          // Passing fake JSON data as response
          resolve([200, productsData]);
        } else {
          reject([400, "نمی توان محصول را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_PRODUCTS_DETAIL}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (productsData) {
          // Passing fake JSON data as response
          const { params } = config;
          const product = productsData.find(
            (product) => product.id.toString() === params.id.toString()
          );
          resolve([200, { ...product, recentProducts, comments }]);
        } else {
          reject([400, "نمی توان جزئیات محصول را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_EVENTS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (events) {
          // Passing fake JSON data as response
          resolve([200, events]);
        } else {
          reject([400, "نمیتوان رویداد را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.SELECT_FOLDER).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mailDB.folders) {
          resolve([200, mailDB.folders]);
        } else {
          reject([400, "نمیتوان پوشه را دریافت کرد"]);
        }
      });
    });
  });

  mock.onPost(url.GET_MAILS_LIST).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // if (mailDB.allmail) {
        //   const configs = JSON.parse(config.data);
        //   const { params } = configs;

        //   let response = [];
        //   // Passing fake JSON data as response
        //   let folderHandle = params;

        //   if (!folderHandle) {
        //     folderHandle = 0;
        //   }

        //   if (folderHandle !== 6) {
        //     const folderId = mailDB.folders.find(folder => folder.id === folderHandle).id;
        //     response = mailDB.allmail.filter(mail => mail.folder === folderId);
        //   } else {
        //     response = mailDB.allmail.filter(mail => mail.starred === true);
        //   }

        //   resolve([200, response]);
        if (mailDB.allmail) {
          // Passing fake JSON data as response
          resolve([200, mailDB.allmail]);
        } else {
          reject([400, "نمی توان تمام ایمیل ها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onPost(url.GET_SELECTED_MAILS).reply(selectedmails => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (selectedmails && selectedmails.data) {
          const params = JSON.parse(selectedmails.data);
          const data = Object.keys(params).map(k => parseInt(params[k]));
          // Passing fake JSON data as response
          resolve([200, (data.length > 1) ? data : params[0]]);
        } else {
          reject([400, "نمی توان تمام ایمیل های انتخاب شده را افزود"]);
        }
      });
    });
  });

  mock.onPost(url.SET_FOLDER_SELECTED_MAILS).reply(request => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (request && request.data) {
          const data = JSON.parse(request.data);
          const { selectedmails, folderId } = data;
          mailDB.allmail = mailDB.allmail.map(mail => {
            if (selectedmails.includes(mail.id)) {
              return {
                ...mail,
                folder: parseInt(folderId)
              };
            }
            return mail;
          });

          resolve([200]);
        } else {

          reject([400, "نمی توان نامه های انتخابی را اضافه کرد"]);
        }
      });
    });
  });

  // mock.onPut(url.UPDATE_MAIL).reply((mail) => {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       if (mail && mail.data) {
  //         const data = JSON.parse(mail.data);

  //         mailDB.allmail = mailDB.allmail.map(mail => {
  //           if (mail.id === data.id) {
  //             return { ...mail, ...data };
  //           }
  //           return mail;
  //         });

  //         resolve([200, data]);
  //       } else {
  //         reject([400, "Cannot update mail data"]);
  //       }
  //     });
  //   });
  // });

  mock.onDelete(url.DELETE_MAIL).reply(config => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as responses
          resolve([200, config.headers.mail]);
        } else {
          reject([400, "نمی توان ایمیل را حذف کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.TRASH_MAIL).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.mail]);
        } else {
          reject([400, "نمیتوان ایمیل را حذف کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.STARED_MAIL).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.mail]);
        } else {
          reject([400, "نمی توان ایمیل را حذف کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_MAILS_ID}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mailDB.allmail) {
          // Passing fake JSON data as response
          const { params } = config;
          const email = mailDB.allmail.find(
            mails => mails.id.toString() === params.id.toString()
          );
          resolve([200, email]);
        } else {
          reject([400, "نمی توان فاکتور دریافت کرد"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_USER).reply((user) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (user && user.data) {
          // Passing fake JSON data as response
          resolve([200, user.data]);
        } else {
          reject([400, "نمی توان کاربر را اضافه کرد"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_USER).reply((user) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (user && user.data) {
          // Passing fake JSON data as response
          resolve([200, user.data]);
        } else {
          reject([400, "نمیتوان کاربر را ویرایش کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_USER).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.user]);
        } else {
          reject([400, "نمیتوان کاربر را حذف کرد"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_PROJECT).reply((project) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (project && project.data) {
          // Passing fake JSON data as response
          resolve([200, project.data]);
        } else {
          reject([400, "نمی توان پروژه را اضافه کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_PROJECT).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.project]);
        } else {
          reject([400, "نمی توان پروژه را حذف کرد"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_EVENT).reply((event) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (event && event.data) {
          // Passing fake JSON data as response
          resolve([200, event.data]);
        } else {
          reject([400, "نمی توان رویداد را اضافه کرد"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_EVENT).reply((event) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (event && event.data) {
          // Passing fake JSON data as response
          resolve([200, event.data]);
        } else {
          reject([400, "رویداد به‌روزرسانی نمی‌شود"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_EVENT).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.event]);
        } else {
          reject([400, "رویداد حذف نمی‌شود"]);
        }
      });
    });
  });

  mock.onGet(url.GET_CATEGORIES).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (calenderDefaultCategories) {
          // Passing fake JSON data as response
          resolve([200, calenderDefaultCategories]);
        } else {
          reject([400, "نمی توان دسته ها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_CHATS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (chats) {
          // Passing fake JSON data as response
          resolve([200, chats]);
        } else {
          reject([400, "نمی توان نمودار ها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_GROUPS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (groups) {
          // Passing fake JSON data as response
          resolve([200, groups]);
        } else {
          reject([400, "نمی توان گروه ها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_CONTACTS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (contacts) {
          // Passing fake JSON data as response
          resolve([200, contacts]);
        } else {
          reject([400, "نمی توان کاربر ها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_MESSAGES}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (messages) {
          // Passing fake JSON data as response
          const { params } = config;
          const filteredMessages = messages.filter(
            msg => msg.roomId === params.roomId
          );
          resolve([200, filteredMessages]);
        } else {
          reject([400, "نمی توان پیام ها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_MESSAGE).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.data) {
          // Passing fake JSON data as response
          resolve([200, config.data]);
        } else {
          reject([400, "نمی توان پیام اضافه کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_MESSAGE).reply(config => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.data])
        } else {
          reject([400, "امکان حذف رویداد وجود ندارد"]);
        }
      })
    })
  })

  mock.onGet(url.GET_ORDERS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (orders) {
          // Passing fake JSON data as response
          resolve([200, orders]);
        } else {
          reject([400, "امکان دریافت سفارش وجود ندارد"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_ORDER).reply((order) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (order && order.data) {
          // Passing fake JSON data as response
          resolve([200, order.data]);
        } else {
          reject([400, "سفارش اضافه نمی شود"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_ORDER).reply((order) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (order && order.data) {
          // Passing fake JSON data as response
          resolve([200, order.data]);
        } else {
          reject([400, "نمی توان سفارش را به روز کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_ORDER).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.order]);
        } else {
          reject([400, "نمی توان سفارش را  حذف کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_CART_DATA).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (cartData) {
          // Passing fake JSON data as response
          resolve([200, cartData]);
        } else {
          reject([400, "نمی توان اطلاعات سبد خرید را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_CUSTOMERS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (customerData) {
          // Passing fake JSON data as response
          resolve([200, customerData]);
        } else {
          reject([400, "نمی توان اطلاعات مشتریان را دریافت کرد"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_CUSTOMER).reply((customer) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (customer && customer.data) {
          // Passing fake JSON data as response
          resolve([200, customer.data]);
        } else {
          reject([400, "نمی توان مشتری اضافه کرد"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_CUSTOMER).reply((customer) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (customer && customer.data) {
          // Passing fake JSON data as response
          resolve([200, customer.data]);
        } else {
          reject([400, "نمی توان مشتری را به روز کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_CUSTOMER).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.customer]);
        } else {
          reject([400, "نمی توان مشتری را حذف کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_SHOPS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shops) {
          // Passing fake JSON data as response
          resolve([200, shops]);
        } else {
          reject([400, "نمی توان داده های فروشگاه را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_WALLET).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (wallet) {
          // Passing fake JSON data as response
          resolve([200, wallet]);
        } else {
          reject([400, "نمی توان داده های کیف پول را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_CRYPTO_PRODUCTS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (productData) {
          // Passing fake JSON data as response
          resolve([200, productData]);
        } else {
          reject([400, "نمی توان اطلاعات محصول را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_CRYPTO_ORDERS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (cryptoOrderData) {
          // Passing fake JSON data as response
          resolve([200, cryptoOrderData]);
        } else {
          reject([400, "امکان دریافت سفارش وجود ندارد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_INVOICES).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (invoiceList) {
          // Passing fake JSON data as response
          resolve([200, invoiceList]);
        } else {
          reject([400, "نمی توان فاکتورها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_INVOICE_DETAIL}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (invoiceList) {
          // Passing fake JSON data as response
          const { params } = config;
          const invoice = invoiceList.find(
            (invoice) => invoice.id.toString() === params.id.toString()
          );
          resolve([200, invoice]);
        } else {
          reject([400, "نمی توان فاکتورها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_PROJECTS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (projects) {
          // Passing fake JSON data as response
          resolve([200, projects]);
        } else {
          reject([400, "نمی توان پروژه ها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_JOB_LIST).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (jobs) {
          // Passing fake JSON data as response
          resolve([200, jobs]);
        } else {
          reject([400, "نمی توان شغل ها را دریافت کرد"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_JOB_LIST).reply((jobList) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (jobList && jobList.data) {
          // Passing fake JSON data as response
          resolve([200, jobList.data]);
        } else {
          reject([400, "نمی توان لیست کار را اضافه کرد"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_JOB_LIST).reply((jobList) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (jobList && jobList.data) {
          // Passing fake JSON data as response
          resolve([200, jobList.data]);
        } else {
          reject([400, "نمی توان لیست مشاغل را به روز کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_JOB_LIST).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.job]);
        } else {
          reject([400, "لیست مشاغل را نمی توان حذف کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_APPLY_JOB).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (jobApply) {
          // Passing fake JSON data as response
          resolve([200, jobApply]);
        } else {
          reject([400, "نمی توان شغل دریافت کرد"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_APPLY_JOB).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.data]);
        } else {
          reject([400, "نمی توان شغل را حذف کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_PROJECT_DETAIL}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (projects) {
          // Passing fake JSON data as response
          const { params } = config;
          const project = projects.find(
            (project) => project.id.toString() === params.id.toString()
          );
          resolve([200, project]);
        } else {
          reject([400, "نمی توان جزئیات پروژه را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_TASKS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (tasks) {
          // Passing fake JSON data as response
          resolve([200, tasks]);
        } else {
          reject([400, "نمی توان وظایف را دریافت کرد"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_CARD_DATA).reply(kanbanData => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (kanbanData && kanbanData.data) {
          // Passing fake JSON data as response
          resolve([200, kanbanData.data])
        } else {
          reject([400, "نمی توان Kanban Data را اضافه کرد"]);
        }
      })
    })
  })

  mock.onPut(url.UPDATE_CARD_DATA).reply(kanbanData => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (kanbanData && kanbanData.data) {
          // Passing fake JSON data as response
          resolve([200, kanbanData.data])
        } else {
          reject([400, "نمی توان لیست مشاغل را به روز کرد"]);
        }
      })
    })
  })

  mock.onDelete(url.DELETE_KANBAN).reply(config => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.kanban])
        } else {
          reject([400, "کانبان را نمی توان حذف کرد"]);
        }
      })
    })
  })

  mock.onGet(url.GET_USERS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (members) {
          // Passing fake JSON data as response
          resolve([200, members]);
        } else {
          reject([400, "نمی توان کاربران را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_USER_PROFILE).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userProfile) {
          // Passing fake JSON data as response
          resolve([200, userProfile]);
        } else {
          reject([400, "نمی توان مشخصات کاربر را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_DASHBOARD_EMAILCHART}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { param } = config;
        if (dahsboardEmail) {
          const filterChart = dahsboardEmail.filter((item) => {
            return item.id === param;
          });

          const data = filterChart.map((item) => item[param]);
          // Passing fake JSON data as response
          resolve([200, data[0]]);
        } else {
          reject([400, "نمی توان داشبورد را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.TOP_SELLING_DATA}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { params } = config;
        if (TopSellingData) {
          const filterChart = TopSellingData.filter((item) => {
            return item.id === params.month;
          });

          const data = filterChart.map((item) => item[params.month]);
          // Passing fake JSON data as response
          resolve([200, data[0]]);
        } else {
          reject([400, "نمی توان داده های فروش را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_EARNING_DATA}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { params } = config;
        if (dashboardEarning) {
          const filterChart = dashboardEarning.filter((item) => {
            return item.id === params.month;
          });

          const data = filterChart.map((item) => item[params.month]);
          // Passing fake JSON data as response
          resolve([200, data[0]]);
        } else {
          reject([400, "نمی توان داده های کسب درآمد را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_VISITOR_DATA}/*`)).reply(config => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {

        const { params } = config;
        if (visitor) {
          const filteredVisitors = visitor.filter((msg) => msg.id === params.roomId);
          // Passing fake JSON data as response
          resolve([200, filteredVisitors]);
        } else {
          reject([400, "نمی توان داده های بازدید کننده را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_STATISTICS_DATA}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { params } = config;
        if (statisticsApplications) {
          const filteredVisitors = statisticsApplications.filter((msg) => msg.id === params.roomId);
          // Passing fake JSON data as response
          resolve([200, filteredVisitors]);
        } else {
          reject([400, "نمی توان داده های آماری را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(new RegExp(`${url.GET_WALLET_DATA}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (walletOptions) {
          const { params } = config;
          const filteredMessages = (walletOptions || []).filter((msg) => msg.id === params.roomId);

          // Passing fake JSON data as response
          resolve([200, filteredMessages]);
        } else {
          reject([400, "نمی توان داده های موجودی کیف پول را دریافت کرد"]);
        }
      });
    });
  });

  mock.onGet(url.GET_PRODUCT_COMMENTS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (productComments) {
          // Passing fake JSON data as response
          resolve([200, productComments]);
        } else {
          reject([400, "نمی توان داده های نظر را دریافت کرد"]);
        }
      });
    });
  });

  mock.onPost(new RegExp(`${url.ON_LIKNE_COMMENT}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      const { data } = config;
      const { params } = JSON.parse(data);

      setTimeout(() => {
        if (productComments) {
          var modifiedProductComments = [...productComments];
          const commentIdx = (modifiedProductComments || []).findIndex(
            (comment) =>
              comment.commentId.toString() === params.commentId.toString()
          );
          if (commentIdx > -1) {
            if (
              params.replyId &&
              modifiedProductComments[commentIdx]["replies"]
            ) {
              const replyIdx = (
                modifiedProductComments[commentIdx]["replies"] || []
              ).findIndex(
                (reply) =>
                  reply.replyId.toString() === params.replyId.toString()
              );

              if (replyIdx > -1) {
                if (
                  modifiedProductComments[commentIdx]["replies"][replyIdx][
                  "hasLiked"
                  ]
                ) {
                  modifiedProductComments[commentIdx]["replies"][replyIdx][
                    "hasLiked"
                  ] = false;
                } else {
                  modifiedProductComments[commentIdx]["replies"][replyIdx][
                    "hasLiked"
                  ] = true;
                }
              }
            } else {
              if (modifiedProductComments[commentIdx]["hasLiked"]) {
                modifiedProductComments[commentIdx]["hasLiked"] = false;
              } else {
                modifiedProductComments[commentIdx]["hasLiked"] = true;
              }
            }
          }

          // Passing fake JSON data as response
          resolve([200, modifiedProductComments]);
        } else {
          reject([400, "نمی توان نظر اضافه کرد"]);
        }
      });
    });
  });

  mock.onPost(new RegExp(`${url.ON_ADD_REPLY}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      const { data } = config;
      const { params } = JSON.parse(data);

      setTimeout(() => {
        if (productComments) {
          const modifiedComments = [...productComments];
          const commentIdx = (modifiedComments || []).findIndex(
            (comment) =>
              comment.commentId.toString() === params.commentId.toString()
          );
          const today = new Date();
          const mins = today.getMinutes();
          if (commentIdx > -1) {
            var newReplyId = 1;
            if (
              modifiedComments[commentIdx]["replies"] &&
              modifiedComments[commentIdx]["replies"].length
            ) {
              const totalReplies = modifiedComments[commentIdx]["replies"];
              newReplyId = totalReplies[totalReplies.length - 1] + 1;
              const replyObj = {
                commentId: params.commentId,
                replyId: newReplyId,
                user: {
                  name: "Admin",
                  profile: "avatar1",
                },
                comment: params.replyText,
                time: `${mins} mins ago`,
                hasLiked: false,
              };
              modifiedComments[commentIdx]["replies"].push({ ...replyObj });
              modifiedComments[commentIdx]["showAddComment"] = false;
            } else {
              modifiedComments[commentIdx]["replies"] = [];
              const replyObj = {
                commentId: params.commentId,
                replyId: newReplyId,
                user: {
                  name: "Admin",
                  profile: "avatar1",
                },
                comment: params.replyText,
                time: `${mins} mins ago`,
                hasLiked: false,
              };
              modifiedComments[commentIdx]["replies"].push({ ...replyObj });
            }
          }

          // Passing fake JSON data as response
          resolve([200, modifiedComments]);
        } else {
          reject([400, "نمی توان نظر اضافه کرد"]);
        }
      });
    });
  });

  mock.onPost(new RegExp(`${url.ON_ADD_COMMENT}/*`)).reply((config) => {
    return new Promise((resolve, reject) => {
      const { data } = config;
      const { params } = JSON.parse(data);

      setTimeout(() => {
        if (productComments) {
          const modifiedComments = [...productComments];

          const today = new Date();
          const mins = today.getMinutes();
          const commentObj = {
            commentId: modifiedComments.length + 1,
            user: {
              name: "Admin",
              profile: "avatar1",
            },
            comment: params.commentText,
            time: `${mins} mins ago`,
            hasLiked: false,
          };
          modifiedComments.push({ ...commentObj });
          productComments.push({ ...commentObj });

          // Passing fake JSON data as response
          resolve([200, modifiedComments]);
        } else {
          reject([400, "نمی توان نظر اضافه کرد"]);
        }
      });
    });
  });
};

export default fakeBackend;
