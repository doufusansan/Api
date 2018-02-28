using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using ZLCMS.Business.Util;
using System.Xml;
using System.Reflection;

namespace ZLCMS.Web
{
    public class Global : System.Web.HttpApplication
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(typeof(Global));

        protected void Application_Start(object sender, EventArgs e)
        {
            //XmlDocument doc = new XmlDocument();
            //doc.Load(Server.MapPath("~/logn4net.config"));
            //string connectionString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + Server.MapPath("~/App_Data/data.mdb") + ";Persist Security Info=False";

            //XmlNode log4NetconnNode = doc.SelectSingleNode("//log4net/appender/connectionString");
            //log4NetconnNode.Attributes["value"].Value = connectionString;
            //log4net.Config.XmlConfigurator.Configure(doc.SelectSingleNode("//log4net") as XmlElement);


            NHibernate.Cfg.Configuration cfg = new NHibernate.Cfg.Configuration();
            //cfg.Properties["connection.connection_string"] = "Data Source=WESKING-PC\\SQLSERVER;Initial Catalog=zlanmssqldb;Persist Security Info=True;User ID=sa;Password=123456";
            DotNet.Common.NHibernateUtil.SessionFactoryHelper.SessionFactory = cfg.Configure().BuildSessionFactory();

            //设置web目录更改时session保存
            PropertyInfo p = typeof(System.Web.HttpRuntime).GetProperty("FileChangesMonitor", BindingFlags.NonPublic | BindingFlags.Public | BindingFlags.Static);
            object o = p.GetValue(null, null);
            FieldInfo f = o.GetType().GetField("_dirMonSubdirs", BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.IgnoreCase);
            object monitor = f.GetValue(o);
            MethodInfo m = monitor.GetType().GetMethod("StopMonitoring", BindingFlags.Instance | BindingFlags.NonPublic);
            m.Invoke(monitor, new object[] { });


            System.Net.ServicePointManager.ServerCertificateValidationCallback = (param, certificate, chain, sslPolicyErrors) => true;


            //命令配置，请把AJAX命令写在该类中
            CommandUtil.InitializeCommand();

        }

        protected void Session_Start(object sender, EventArgs e)
        {
        }

        protected void Session_End(object sender, EventArgs e)
        { 
        }

        protected void Application_PreRequestHandlerExecute(object sender, EventArgs e)
        {
        }

        void Application_End(object sender, EventArgs e)
        {
        }

        protected void Application_Error(object sender, EventArgs e)
        {
        }
    }
}