/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      pageNum: number;
      /** page size */
      pageSize: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T extends NonNullable<unknown>> extends PaginatingCommonParams {
      list: T[];
    }

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T extends NonNullable<unknown>> = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | null;
    } & T;
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
      tenantId: string;
    }

    interface UserInfo {
      userId: string;
      username: string;
      roles: string[];
      permissions: string[];
      tenantName: string;
      nickname: string;
    }
  }

  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }

  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'pageNum' | 'pageSize'>;

    /** role */
    type Role = Common.CommonRecord<{
      /** role id */
      roleId: number;
      /** role name */
      roleName: string;
      /** role code */
      roleCode: string;
      /** role description */
      remark: string;
      /** 权限列表ID集合(选中 ids) */
      permissions?: number[];
      /** 权限列表ID集合(半选 ids) */
      permissionKeys?: number[];
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'status'> & CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'roleId' | 'roleName' | 'roleCode'>;

    type PostOptions = Pick<Post, 'postId' | 'postName' | 'postCode'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = Common.CommonRecord<{
      userId: number;
      /** user name */
      account: string;
      password: string;
      /** user gender */
      sex: UserGender | null;
      /** user nick name */
      nickname: string;
      /** user phone */
      mobile: string;
      /** user email */
      email: string;
      /** user role id collection */
      roleIds: string[];
      isEnable: boolean;
      deptId: number;
      postId: number[];
    }>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'account' | 'sex' | 'nickname' | 'mobile' | 'email' | 'status'> & CommonSearchParams
    >;

    type PostSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Post, 'postName' | 'postCode' | 'status'> & CommonSearchParams
    >;

    type TenantSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Tenant, 'tenantId' | 'tenantName' | 'tenantCode' | 'beginDate' | 'endDate' | 'status'> &
        CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "0": directory
     * - "1": menu
     * - "2": button
     */
    type MenuType = '0' | '1' | '2';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type Menu = Common.CommonRecord<{
      /** parent menu id */
      parentId: number;
      /** menu type */
      menuType: MenuType;
      /** menu name */
      menuName: string;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
      /** component */
      component?: string;
      /**
       * i18n key
       *
       * it is for internationalization
       */
      i18nKey?: App.I18n.I18nKey;
      /** iconify icon name or local icon name */
      icon: string;
      localIcon: string;
      /** icon type */
      iconType: IconType;
      /** menu order */
      orderNum: number;
      /** whether to cache the route */
      keepAlive?: boolean;
      /** outer link */
      href?: string;
      /** whether to hide the route in the menu */
      hideInMenu?: boolean;
      /**
       * The menu key will be activated when entering the route
       *
       * The route is not in the menu
       *
       * @example
       *   the route is "user_detail", if it is set to "user_list", the menu "user_list" will be activated
       */
      activeMenu?: import('@elegant-router/types').LastLevelRouteKey;
      /** By default, the same route path will use one tab, if set to true, it will use multiple tabs */
      multiTab?: boolean;
      /** If set, the route will be fixed in tabs, and the value is the order of fixed tabs */
      fixedIndexInTab?: number;
      /** menu buttons */
      buttons?: MenuButton[];
      /** children menu */
      children?: Menu[];
      isFrame?: boolean;
      permissionCode?: string;
      permissionName?: string;
    }>;

    type Dept = Common.CommonRecord<{
      deptId: number;
      deptName: string;
      parent: number;
      parentName?: string;
      isEnable?: boolean;
      orderNum: number;
    }>;

    type Post = Common.CommonRecord<{
      postId: number;
      postName: string;
      postCode: string;
      orderNum: number;
    }>;

    type Tenant = Common.CommonRecord<{
      id: number;
      tenantCode: string;
      tenantName: string;
      beginDate?: string;
      endDate?: string;
    }>;
  }
}
