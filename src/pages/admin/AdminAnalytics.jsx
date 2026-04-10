import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const DollarSignIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PackageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const MousePointerIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, funnelRes, insightsRes] = await Promise.all([
        api.get(`/analytics/overview?period=${period}`),
        api.get(`/analytics/funnel?period=${period}`),
        api.get('/analytics/inventory-insights')
      ]);

      setAnalytics(overviewRes.data.analytics);
      setFunnel(funnelRes.data.funnel);
      setInsights(insightsRes.data.insights);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-ivory-100/50 text-xs uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon />
        </div>
      </div>
      <p className="text-3xl font-serif text-ivory-100 mb-1">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 text-xs ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
          {changeType === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
          {change}
        </div>
      )}
    </motion.div>
  );

  const RevenueChart = () => {
    if (!analytics?.dailyTrend) return null;

    const data = analytics.dailyTrend;
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

    return (
      <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-serif text-ivory-100 mb-6">Revenue Trend</h3>
        <div className="h-64 flex items-end gap-1">
          {data.map((day, index) => {
            const height = (day.revenue / maxRevenue) * 100;
            const date = new Date(day.date);
            const label = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full flex justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 2)}%` }}
                    transition={{ delay: index * 0.02, duration: 0.5 }}
                    className="w-4/5 bg-gradient-to-t from-gold-500/50 to-gold-300/50 rounded-t-sm cursor-pointer hover:from-gold-400 hover:to-gold-200 transition-colors"
                  />
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-charcoal-100 border border-ivory-100/10 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <p className="text-xs text-ivory-100/70">{label}</p>
                    <p className="text-sm text-gold-300 font-medium">{formatCurrency(day.revenue)}</p>
                    <p className="text-xs text-ivory-100/50">{day.orders} orders</p>
                  </div>
                </div>
                <span className="text-ivory-100/30 text-2xs mt-2">
                  {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ConversionFunnel = () => {
    if (!funnel) return null;

    const stages = [
      { name: 'Page Views', value: funnel.pageViews, icon: EyeIcon, color: 'bg-blue-500/20 text-blue-400' },
      { name: 'Product Views', value: funnel.productViews, icon: EyeIcon, color: 'bg-purple-500/20 text-purple-400' },
      { name: 'Add to Cart', value: funnel.addToCart, icon: ShoppingCartIcon, color: 'bg-orange-500/20 text-orange-400' },
      { name: 'Checkouts', value: funnel.checkouts, icon: MousePointerIcon, color: 'bg-pink-500/20 text-pink-400' },
      { name: 'Orders', value: funnel.orders, icon: PackageIcon, color: 'bg-emerald-500/20 text-emerald-400' }
    ];

    const maxValue = Math.max(...stages.map(s => s.value), 1);

    return (
      <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-serif text-ivory-100 mb-6">Conversion Funnel</h3>
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const width = (stage.value / maxValue) * 100;
            const nextStage = stages[index + 1];
            const dropRate = nextStage ? ((1 - nextStage.value / stage.value) * 100).toFixed(1) : null;

            return (
              <div key={stage.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stage.color}`}>
                      <stage.icon />
                    </div>
                    <span className="text-ivory-100/70 text-sm">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gold-300 font-medium">{stage.value.toLocaleString()}</span>
                    {dropRate !== null && stage.value > 0 && (
                      <span className="text-red-400 text-xs">{dropRate}% drop</span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-charcoal-200/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${stage.color.replace('/20', '/40').replace('-500', '-400')}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-ivory-100/10 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-charcoal-200/30 rounded-xl">
            <p className="text-2xl font-serif text-gold-300">{funnel.rates.viewToCart}%</p>
            <p className="text-ivory-100/50 text-xs mt-1">View to Cart</p>
          </div>
          <div className="text-center p-4 bg-charcoal-200/30 rounded-xl">
            <p className="text-2xl font-serif text-emerald-400">{funnel.rates.overall}%</p>
            <p className="text-ivory-100/50 text-xs mt-1">Overall Conversion</p>
          </div>
        </div>
      </div>
    );
  };

  const TopProducts = () => {
    if (!analytics?.topProducts?.length) return null;

    return (
      <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-serif text-ivory-100 mb-6">Top Products</h3>
        <div className="space-y-4">
          {analytics.topProducts.slice(0, 5).map((product, index) => (
            <motion.div
              key={product.productId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-3 bg-charcoal-200/30 rounded-xl"
            >
              <span className="w-8 h-8 rounded-lg bg-gold-300/20 text-gold-300 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="w-12 h-12 bg-charcoal-100 rounded-lg overflow-hidden flex-shrink-0">
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ivory-100 text-sm truncate">{product.name}</p>
                <p className="text-ivory-100/50 text-xs">{product.unitsSold} sold</p>
              </div>
              <div className="text-right">
                <p className="text-gold-300 font-medium">{formatCurrency(product.revenue)}</p>
                <p className="text-ivory-100/50 text-xs">{product.orders} orders</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const InsightsPanel = () => {
    if (!insights) return null;

    return (
      <div className="space-y-6">
        {insights.lowStock?.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <PackageIcon />
              </div>
              <div>
                <h3 className="text-ivory-100 font-medium">Low Stock Alert</h3>
                <p className="text-ivory-100/50 text-sm">{insights.lowStock.length} products need restocking</p>
              </div>
            </div>
            <div className="space-y-2">
              {insights.lowStock.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-charcoal-200/50 rounded-lg">
                  <span className="text-ivory-100 text-sm">{item.name}</span>
                  <span className="text-orange-400 text-sm">{item.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.outOfStock?.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <PackageIcon />
              </div>
              <div>
                <h3 className="text-ivory-100 font-medium">Out of Stock</h3>
                <p className="text-ivory-100/50 text-sm">{insights.outOfStock.length} products unavailable</p>
              </div>
            </div>
            <div className="space-y-2">
              {insights.outOfStock.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-charcoal-200/50 rounded-lg">
                  <span className="text-ivory-100 text-sm">{item.name}</span>
                  <span className="text-red-400 text-sm">Out of stock</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.fastMoving?.length > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUpIcon />
              </div>
              <div>
                <h3 className="text-ivory-100 font-medium">Fast Moving</h3>
                <p className="text-ivory-100/50 text-sm">Top performers this period</p>
              </div>
            </div>
            <div className="space-y-2">
              {insights.fastMoving.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-charcoal-200/50 rounded-lg">
                  <span className="text-ivory-100 text-sm">{item.name}</span>
                  <span className="text-emerald-400 text-sm">{item.unitsSold} sold</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.slowMoving?.length > 0 && (
          <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-charcoal-200/50 flex items-center justify-center text-ivory-100/50">
                <TrendingDownIcon />
              </div>
              <div>
                <h3 className="text-ivory-100 font-medium">Slow Moving</h3>
                <p className="text-ivory-100/50 text-sm">{insights.slowMoving.length} products need attention</p>
              </div>
            </div>
            <div className="space-y-2">
              {insights.slowMoving.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-charcoal-200/50 rounded-lg">
                  <span className="text-ivory-100 text-sm">{item.name}</span>
                  <span className="text-ivory-100/50 text-sm">{item.stock} in stock</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-300 p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-300">
      <div className="px-6 pt-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="heading-2 text-ivory-100">Analytics</h1>
            <p className="text-ivory-100/50 font-light mt-1">Business intelligence and insights</p>
          </div>
          <div className="flex items-center gap-3">
            {['7days', '30days', '90days'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm rounded-xl transition-colors ${
                  period === p
                    ? 'bg-gold-300 text-charcoal-300'
                    : 'bg-charcoal-100/30 text-ivory-100/70 hover:bg-charcoal-100/50'
                }`}
              >
                {p === '7days' ? '7 Days' : p === '30days' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics?.sales?.totalRevenue || 0)}
            change={`${analytics?.sales?.revenueGrowth || 0}% vs prev`}
            changeType={analytics?.sales?.revenueGrowth >= 0 ? 'up' : 'down'}
            icon={DollarSignIcon}
            color="bg-gold-500/20 text-gold-400"
          />
          <StatCard
            title="Orders"
            value={analytics?.orders?.total || 0}
            change={`${analytics?.orders?.completionRate || 0}% completed`}
            icon={PackageIcon}
            color="bg-purple-500/20 text-purple-400"
          />
          <StatCard
            title="Average Order"
            value={formatCurrency(analytics?.sales?.averageOrderValue || 0)}
            icon={ShoppingCartIcon}
            color="bg-blue-500/20 text-blue-400"
          />
          <StatCard
            title="Total Users"
            value={analytics?.users?.totalUsers || 0}
            change={`+${analytics?.users?.newUsers || 0} new`}
            icon={UsersIcon}
            color="bg-emerald-500/20 text-emerald-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueChart />
          <ConversionFunnel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopProducts />
          <InsightsPanel />
        </div>

        {analytics?.orders?.byStatus && (
          <div className="bg-charcoal-100/30 border border-ivory-100/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-serif text-ivory-100 mb-6">Orders by Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(analytics.orders.byStatus).map(([status, count]) => {
                const colors = {
                  pending: 'bg-yellow-500/20 text-yellow-400',
                  processing: 'bg-blue-500/20 text-blue-400',
                  shipped: 'bg-indigo-500/20 text-indigo-400',
                  delivered: 'bg-emerald-500/20 text-emerald-400',
                  cancelled: 'bg-red-500/20 text-red-400'
                };

                return (
                  <div key={status} className="text-center p-4 bg-charcoal-200/30 rounded-xl">
                    <p className="text-2xl font-serif text-ivory-100">{count}</p>
                    <p className={`text-xs mt-1 capitalize px-2 py-1 rounded-full inline-block ${colors[status]}`}>
                      {status}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
