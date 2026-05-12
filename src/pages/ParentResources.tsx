import { motion } from "framer-motion";
import { Calendar, Video, BookOpen, Clock, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const EVENT_ICONS = {
  webinar: <Video className="w-5 h-5 text-indigo-500" />,
  workshop: <BookOpen className="w-5 h-5 text-amber-500" />,
  deadline: <Clock className="w-5 h-5 text-rose-500" />,
  notice: <Calendar className="w-5 h-5 text-sage-600" />
};

export default function ParentResources() {
  const { user } = useAuth();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["parent-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_events")
        .select("*")
        .in("target_audience", ["all", "parents"])
        .order("event_date", { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date());

  return (
    <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              Events & Resources
            </h1>
            <p className="text-muted-foreground">
              Stay informed with upcoming workshops, deadlines, and guidance webinars tailored for parents.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Events Section */}
              <section>
                <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Upcoming Schedule</h2>
                {upcomingEvents.length === 0 ? (
                  <div className="card-warm p-8 text-center text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p>No upcoming events scheduled.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="card-warm p-5 hover:border-primary/40 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                            {EVENT_ICONS[event.type as keyof typeof EVENT_ICONS] || EVENT_ICONS.notice}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                              {new Date(event.event_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <h3 className="font-heading font-semibold text-foreground mb-1">{event.title}</h3>
                            <p className="text-sm text-foreground/70 mb-4">{event.description}</p>
                            
                            <Button variant="outline" size="sm" className="w-full">
                              {event.type === 'webinar' ? 'Register Link' : 'Add to Calendar'}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Resource Library / Past Events */}
              <section>
                <h2 className="font-heading font-semibold text-xl text-foreground mb-4">Resource Library & Past Webinars</h2>
                <div className="card-warm p-6 bg-muted/20">
                  {pastEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center">No past resources available yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {pastEvents.map(event => (
                        <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border">
                          <div className="flex items-center gap-3">
                            {EVENT_ICONS[event.type as keyof typeof EVENT_ICONS] || EVENT_ICONS.notice}
                            <div>
                              <h4 className="font-medium text-foreground">{event.title}</h4>
                              <p className="text-xs text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="shrink-0 text-primary">
                            View Materials
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

            </div>
          )}
        </motion.div>
    </div>
  );
}
