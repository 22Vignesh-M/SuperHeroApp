#include "mongoose.h"
#include<iostream>

using namespace std;

static const char *s_http_port = "8000";
static struct mg_serve_http_opts s_http_server_opts;

struct mg_mgr mgr;
struct mg_connection *ncg;

string s_url = "https://akabab.github.io/superhero-api/api/id/";
static int s_exit_flag = 0;

static void handler(struct mg_connection *nc1, int ev1, void *ev_data1) {
	
  struct http_message *hm = (struct http_message *) ev_data1;
  int connect_status;
  
  switch (ev1) {
    case MG_EV_CONNECT:
      	connect_status = *(int *) ev_data1;
      	if (connect_status != 0) {
        	printf("Error connecting to %s: %s\n", s_url.c_str(), strerror(connect_status));
        	s_exit_flag = 1;
      	}	 
      break;
    case MG_EV_HTTP_REPLY:
		mg_printf(ncg, "%s", "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\nContent-Type: application/json\r\n\r\n");
		mg_printf_http_chunk(ncg, (char *)hm->body.p);
		mg_send_http_chunk(ncg, "", 0); 
      	nc1->flags |= MG_F_SEND_AND_CLOSE;
      	s_exit_flag = 1;
      	break;
    case MG_EV_CLOSE:
      	if (s_exit_flag == 0) {
        	printf("Server closed connection\n");
        	s_exit_flag = 1;
      	};
      	break;
    default:
      	break;
  }
}
	
static void ev_handler(struct mg_connection *ncc, int ev, void *ev_data) {
  	struct http_message *hm = (struct http_message *) ev_data;
	ncg = ncc;
  	switch (ev) {
    	case MG_EV_HTTP_REQUEST:
      		if (mg_vcmp(&hm->uri, "/get") == 0) {
        		char n1[100];
        		string url;
        		mg_get_http_var(&hm->body, "n1", n1, sizeof(n1));
        		url = s_url + n1 + ".json";
				printf("%s", url.c_str());
        		s_exit_flag = 0;
            
        		struct mg_mgr mgr1;
				struct mg_connection *nc1;
				mg_mgr_init(&mgr1, NULL);
				nc1 = mg_connect_http(&mgr1, handler, url.c_str(), NULL, NULL);
				mg_set_protocol_http_websocket(nc1);
		
				while (s_exit_flag == 0) {
					mg_mgr_poll(&mgr1, 1);
				}
				mg_mgr_free(&mgr1);

        
      		} else if (mg_vcmp(&hm->uri, "/printcontent") == 0) {
        		char buf[100] = {0};
        		memcpy(buf, hm->body.p,
            	sizeof(buf) - 1 < hm->body.len ? sizeof(buf) - 1 : hm->body.len);
        		printf("%s\n", buf);
      		} else {
        		mg_serve_http(ncc, hm, s_http_server_opts);
      		}
      		break;
    	default:
      		break;
  }
}

int main() {
	
	struct mg_connection *nc;  
	struct mg_bind_opts bind_opts;
  
	const char *err_str;
#if MG_ENABLE_SSL
  	const char *ssl_cert = NULL;
#endif

  	mg_mgr_init(&mgr, NULL);
  
  	s_http_server_opts.document_root = "./web/";

  	memset(&bind_opts, 0, sizeof(bind_opts));
  	bind_opts.error_string = &err_str;
#if MG_ENABLE_SSL
  	if (ssl_cert != NULL) {
    	bind_opts.ssl_cert = ssl_cert;
  	}
#endif
  	nc = mg_bind_opt(&mgr, s_http_port, ev_handler, bind_opts);
  	if (nc == NULL) {
    	fprintf(stderr, "Error starting server on port %s: %s\n", s_http_port,
        *bind_opts.error_string);
    	exit(1);
  	}
  
  	mg_set_protocol_http_websocket(nc);
  	s_http_server_opts.enable_directory_listing = "yes";

  	printf("Starting server on port %s, serving %s\n", s_http_port, s_http_server_opts.document_root);
  	for (;;) {
    	mg_mgr_poll(&mgr, 1000);
  	}
  	mg_mgr_free(&mgr);
  	return 0;
}

